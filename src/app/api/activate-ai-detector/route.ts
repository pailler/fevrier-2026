import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();
    
    if (!userId && !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId ou email requis' 
      }, { status: 400 });
    }

    let targetUserId = userId;

    // Si on a un email mais pas d'userId, chercher l'utilisateur par email
    if (!userId && email) {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        return NextResponse.json({ 
          success: false, 
          error: 'Utilisateur non trouvé avec cet email' 
        }, { status: 404 });
      }

      targetUserId = userData.id;
    }

    console.log('🔄 Activation du module Détecteur IA pour l\'utilisateur:', targetUserId);

    // 1. Vérifier/Créer le module AI Detector
    let moduleId = 'ai-detector';
    const { data: existingModule, error: moduleError } = await supabase
      .from('modules')
      .select('id, title')
      .or('id.eq.ai-detector,title.ilike.%ai-detector%')
      .single();

    if (moduleError || !existingModule) {
      const { data: newModule, error: createError } = await supabase
        .from('modules')
        .insert([{
          id: 'ai-detector',
          title: 'Détecteur de Contenu IA',
          description: 'Analysez vos documents et images pour détecter la proportion de contenu généré par l\'intelligence artificielle.',
          category: 'OUTILS IA',
          price: 100,
          url: '/ai-detector',
          image_url: '/images/ai-detector.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur création module:', createError);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la création du module' 
        }, { status: 500 });
      }

      moduleId = newModule.id;
      console.log('✅ Module Détecteur IA créé:', moduleId);
    } else {
      moduleId = existingModule.id;
      console.log('✅ Module Détecteur IA trouvé:', moduleId);
    }

    // 2. Vérifier si l'utilisateur a déjà accès
    const { data: existingAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, usage_count')
      .eq('user_id', targetUserId)
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .single();

    if (existingAccess) {
      return NextResponse.json({
        success: true,
        message: 'Détecteur IA déjà enregistré sur ce compte',
        accessId: existingAccess.id,
        usageCount: existingAccess.usage_count
      });
    }

    // 3. Vérifier le solde de tokens (100 tokens requis)
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', targetUserId)
      .single();

    const tokenBalance = userTokens?.tokens || 0;
    
    if (tokenBalance < 100) {
      return NextResponse.json({
        success: false,
        error: `Solde de crédits insuffisant. Vous avez ${tokenBalance} crédits, mais 100 crédits sont requis pour ouvrir l'accès à cette appli.`,
        requiredTokens: 100,
        currentBalance: tokenBalance,
        pricingUrl: 'https://iahome.fr/pricing2'
      }, { status: 400 });
    }

    // 4. Débiter les tokens directement depuis la base de données
    const newTokenBalance = tokenBalance - 100;
    const { error: updateTokensError } = await supabase
      .from('user_tokens')
      .update({ 
        tokens: newTokenBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', targetUserId)
      .eq('tokens', tokenBalance); // Condition optimiste

    if (updateTokensError) {
      // Si la mise à jour échoue, vérifier à nouveau le solde
      const { data: recheckTokens } = await supabase
        .from('user_tokens')
        .select('tokens')
        .eq('user_id', targetUserId)
        .single();
      
      const recheckBalance = recheckTokens?.tokens || 0;
      
      if (recheckBalance < 100) {
        return NextResponse.json({
          success: false,
          error: `Solde de crédits insuffisant. Vous avez ${recheckBalance} crédits, mais 100 crédits sont requis.`,
          requiredTokens: 100,
          currentBalance: recheckBalance,
          pricingUrl: 'https://iahome.fr/pricing2'
        }, { status: 400 });
      }

      // Réessayer avec le nouveau solde
      const retryNewBalance = recheckBalance - 100;
      const { error: retryError } = await supabase
        .from('user_tokens')
        .update({ 
          tokens: retryNewBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', targetUserId)
        .eq('tokens', recheckBalance);

      if (retryError) {
        return NextResponse.json({
          success: false,
          error: 'Erreur lors du débit des tokens. Veuillez réessayer.',
          pricingUrl: 'https://iahome.fr/pricing2'
        }, { status: 500 });
      }
    }

    const now = new Date().toISOString();
    const { data: accessData, error: createAccessError } = await supabase
      .from('user_applications')
      .insert([{
        user_id: targetUserId,
        module_id: moduleId,
        module_title: 'Détecteur de Contenu IA',
        is_active: true,
        access_level: 'premium',
        usage_count: 0,
        created_at: now,
        updated_at: now
      }])
      .select()
      .single();

    if (createAccessError) {
      console.error('❌ Erreur création accès:', createAccessError);
      // Rembourser les tokens en cas d'erreur
      try {
        const { data: currentTokens } = await supabase
          .from('user_tokens')
          .select('tokens')
          .eq('user_id', targetUserId)
          .single();
        
        const newBalance = (currentTokens?.tokens || 0) + 100;
        await supabase
          .from('user_tokens')
          .upsert({
            user_id: targetUserId,
            tokens: newBalance,
            updated_at: new Date().toISOString()
          });
        console.log('✅ Tokens remboursés:', 100);
      } catch (refundError) {
        console.error('❌ Erreur lors du remboursement:', refundError);
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la création de l\'accès' 
      }, { status: 500 });
    }

    console.log('✅ Accès Détecteur IA créé avec succès:', accessData.id);
    console.log('✅ Tokens débités:', 100);

    return NextResponse.json({
      success: true,
      message: 'Accès au Détecteur IA ouvert sur votre compte',
      accessId: accessData.id,
      moduleId: moduleId,
      tokensDebited: 100,
      remainingBalance: tokenBalance - 100
    });

  } catch (error) {
    console.error('❌ Erreur activation Détecteur IA:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

