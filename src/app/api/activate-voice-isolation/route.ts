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

    if (!userId || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId et email requis' 
      }, { status: 400 });
    }

    console.log('🔄 Activation Voice Isolation pour l\'utilisateur:', userId);

    // 1. Vérifier les tokens de l'utilisateur (100 tokens requis)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tokens')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('❌ Erreur récupération utilisateur:', userError);
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 });
    }

    const currentTokens = userData.tokens || 0;
    const requiredTokens = 100;

    if (currentTokens < requiredTokens) {
      console.log(`❌ Tokens insuffisants: ${currentTokens} < ${requiredTokens}`);
      return NextResponse.json({ 
        success: false, 
        error: `Tokens insuffisants. Vous avez ${currentTokens} tokens, ${requiredTokens} tokens sont requis.` 
      }, { status: 400 });
    }

    // 2. Consommer les tokens
    const newTokenBalance = currentTokens - requiredTokens;
    const { error: tokenUpdateError } = await supabase
      .from('users')
      .update({ tokens: newTokenBalance })
      .eq('id', userId);

    if (tokenUpdateError) {
      console.error('❌ Erreur mise à jour tokens:', tokenUpdateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la consommation des tokens' 
      }, { status: 500 });
    }

    console.log(`✅ ${requiredTokens} tokens consommés. Nouveau solde: ${newTokenBalance}`);

    // 3. Vérifier si le module Voice Isolation existe, sinon le créer
    let { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, price, is_visible')
      .eq('id', 'voice-isolation')
      .single();

    if (moduleError || !moduleData) {
      console.log('⚠️ Module Voice Isolation non trouvé, création du module...');
      
      // Créer le module dans la table modules
      const newModuleData = {
        id: 'voice-isolation',
        title: 'Isolation Vocale par IA',
        description: 'Séparez la voix, la batterie, la basse et les autres instruments de vos fichiers audio avec une précision exceptionnelle. Basé sur Demucs v4, un modèle d\'IA de pointe pour la séparation de sources audio.',
        category: 'IA Audio',
        price: 100,
        url: '/voice-isolation',
        image_url: '/images/voice-isolation.jpg',
        is_visible: true, // Important : rendre le module visible dans /encours
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdModule, error: createModuleError } = await supabase
        .from('modules')
        .insert([newModuleData])
        .select()
        .single();

      if (createModuleError || !createdModule) {
        console.error('❌ Erreur lors de la création du module:', createModuleError);
        // Rembourser les tokens en cas d'erreur
        await supabase
          .from('users')
          .update({ tokens: currentTokens })
          .eq('id', userId);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la création du module Voice Isolation' 
        }, { status: 500 });
      }

      moduleData = createdModule;
      console.log('✅ Module Voice Isolation créé avec succès:', moduleData.id);
    } else {
      // S'assurer que le module est visible
      if (moduleData.is_visible === false) {
        console.log('⚠️ Module Voice Isolation existe mais n\'est pas visible, mise à jour...');
        const { error: updateError } = await supabase
          .from('modules')
          .update({ is_visible: true, updated_at: new Date().toISOString() })
          .eq('id', 'voice-isolation');

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour de la visibilité:', updateError);
        } else {
          console.log('✅ Visibilité du module Voice Isolation mise à jour');
        }
      }
      console.log('✅ Module Voice Isolation trouvé:', moduleData.id);
    }

    // 4. Vérifier si l'utilisateur a déjà un accès (actif ou expiré)
    const { data: existingAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, expires_at, usage_count')
      .eq('user_id', userId)
      .eq('module_id', 'voice-isolation')
      .single();

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30); // 1 mois (30 jours)

    let accessData;

    if (existingAccess) {
      // Vérifier si l'accès est actif et non expiré
      const isActive = existingAccess.is_active;
      const isExpired = existingAccess.expires_at ? new Date(existingAccess.expires_at) <= now : false;

      if (isActive && !isExpired) {
        console.log('✅ Voice Isolation déjà activé pour l\'utilisateur');
        // Rembourser les tokens car l'application est déjà activée
        await supabase
          .from('users')
          .update({ tokens: currentTokens })
          .eq('id', userId);
        return NextResponse.json({
          success: true,
          message: 'Voice Isolation déjà activé',
          accessId: existingAccess.id,
          moduleId: 'voice-isolation',
          expiresAt: existingAccess.expires_at,
          tokensRefunded: true
        });
      }

      // Si le module est expiré ou désactivé, le réactiver avec usage_count = 0
      console.log('🔄 Réactivation de Voice Isolation (module expiré ou désactivé)');
      const { data: reactivatedAccess, error: reactivateError } = await supabase
        .from('user_applications')
        .update({
          is_active: true,
          access_level: 'premium',
          usage_count: 0, // Réinitialiser le compteur d'utilisation
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAccess.id)
        .select()
        .single();

      if (reactivateError) {
        console.error('❌ Erreur réactivation accès:', reactivateError);
        // Rembourser les tokens en cas d'erreur
        await supabase
          .from('users')
          .update({ tokens: currentTokens })
          .eq('id', userId);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la réactivation de l\'accès' 
        }, { status: 500 });
      }

      accessData = reactivatedAccess;
      console.log('✅ Accès Voice Isolation réactivé avec succès:', accessData.id);
    } else {
      // Créer un nouvel accès
      const { data: newAccess, error: createAccessError } = await supabase
        .from('user_applications')
        .insert([{
          user_id: userId,
          module_id: 'voice-isolation',
          module_title: 'Isolation Vocale par IA',
          is_active: true,
          access_level: 'premium',
          usage_count: 0,
          max_usage: null,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createAccessError) {
        console.error('❌ Erreur création accès:', createAccessError);
        // Rembourser les tokens en cas d'erreur
        await supabase
          .from('users')
          .update({ tokens: currentTokens })
          .eq('id', userId);
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la création de l\'accès' 
        }, { status: 500 });
      }

      accessData = newAccess;
      console.log('✅ Accès Voice Isolation créé avec succès:', accessData.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Voice Isolation activé avec succès',
      accessId: accessData.id,
      moduleId: 'voice-isolation',
      expiresAt: expiresAt.toISOString(),
      tokensConsumed: requiredTokens,
      remainingTokens: newTokenBalance
    });

  } catch (error) {
    console.error('❌ Erreur activation Voice Isolation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
