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

    // 1. Vérifier que l'utilisateur existe dans profiles
    let targetUserId = userId;
    
    // Si userId est un email, récupérer l'UUID depuis profiles
    if (userId.includes('@')) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userId)
        .single();
      
      if (profileError || !profile) {
        console.error('❌ Utilisateur non trouvé dans profiles:', profileError);
        return NextResponse.json({ 
          success: false, 
          error: 'Utilisateur non trouvé' 
        }, { status: 404 });
      }
      targetUserId = profile.id;
      console.log('🔄 UUID récupéré:', targetUserId, 'pour email:', userId);
    } else {
      // Vérifier que l'UUID existe dans profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', targetUserId)
        .single();
      
      if (profileError || !profile) {
        console.error('❌ Utilisateur non trouvé dans profiles:', profileError);
        return NextResponse.json({ 
          success: false, 
          error: 'Utilisateur non trouvé' 
        }, { status: 404 });
      }
    }

    // 2. Vérifier et consommer les tokens via l'API user-tokens-simple
    const requiredTokens = 100;
    
    // Récupérer les tokens actuels
    const tokensResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user-tokens-simple?userId=${targetUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!tokensResponse.ok) {
      const tokensData = await tokensResponse.json().catch(() => ({}));
      const currentTokens = tokensData.tokensRemaining || tokensData.tokens || 0;
      
      if (currentTokens < requiredTokens) {
        return NextResponse.json({ 
          success: false, 
          error: `Tokens insuffisants. Vous avez ${currentTokens} tokens, ${requiredTokens} tokens sont requis.` 
        }, { status: 400 });
      }
    }

    const tokensData = await tokensResponse.json().catch(() => ({ tokensRemaining: 0 }));
    const currentTokens = tokensData.tokensRemaining || tokensData.tokens || 0;

    if (currentTokens < requiredTokens) {
      console.log(`❌ Tokens insuffisants: ${currentTokens} < ${requiredTokens}`);
      return NextResponse.json({ 
        success: false, 
        error: `Tokens insuffisants. Vous avez ${currentTokens} tokens, ${requiredTokens} tokens sont requis.` 
      }, { status: 400 });
    }

    // Consommer les tokens via l'API user-tokens-simple
    const consumeResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user-tokens-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: targetUserId,
        tokensToConsume: requiredTokens,
        moduleId: 'voice-isolation',
        moduleName: 'Isolation Vocale par IA',
        action: 'voice-isolation.activate',
        description: 'Activation de l\'application Isolation Vocale par IA'
      })
    });

    if (!consumeResponse.ok) {
      const consumeError = await consumeResponse.json().catch(() => ({}));
      console.error('❌ Erreur consommation tokens:', consumeError);
      return NextResponse.json({ 
        success: false, 
        error: consumeError.message || 'Erreur lors de la consommation des tokens' 
      }, { status: 500 });
    }

    const consumeResult = await consumeResponse.json();
    const newTokenBalance = consumeResult.tokensRemaining || (currentTokens - requiredTokens);

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
        is_visible: true, // Important : rendre le module visible dans /account
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
        // Rembourser les tokens en cas d'erreur (via API)
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user-tokens-simple`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: targetUserId,
            tokensToConsume: -requiredTokens, // Remboursement
            moduleId: 'voice-isolation',
            moduleName: 'Isolation Vocale par IA',
            action: 'voice-isolation.refund',
            description: 'Remboursement - Erreur création module'
          })
        }).catch(() => {});
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

    const { data: existingAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, usage_count')
      .eq('user_id', targetUserId)
      .eq('module_id', 'voice-isolation')
      .single();

    const now = new Date().toISOString();
    let accessData;

    if (existingAccess && existingAccess.is_active) {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user-tokens-simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          tokensToConsume: -requiredTokens,
          moduleId: 'voice-isolation',
          moduleName: 'Isolation Vocale par IA',
          action: 'voice-isolation.refund',
          description: 'Remboursement - Déjà activé'
        })
      }).catch(() => {});
      return NextResponse.json({
        success: true,
        message: 'Voice Isolation déjà activé',
        accessId: existingAccess.id,
        moduleId: 'voice-isolation',
        tokensRefunded: true
      });
    }

    if (existingAccess) {
      const { data: reactivatedAccess, error: reactivateError } = await supabase
        .from('user_applications')
        .update({
          is_active: true,
          access_level: 'premium',
          usage_count: 0,
          updated_at: now
        })
        .eq('id', existingAccess.id)
        .select()
        .single();

      if (reactivateError) {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user-tokens-simple`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: targetUserId,
            tokensToConsume: -requiredTokens,
            moduleId: 'voice-isolation',
            moduleName: 'Isolation Vocale par IA',
            action: 'voice-isolation.refund',
            description: 'Remboursement - Erreur réactivation'
          })
        }).catch(() => {});
        return NextResponse.json({ success: false, error: 'Erreur lors de la réactivation de l\'accès' }, { status: 500 });
      }
      accessData = reactivatedAccess;
    } else {
      const { data: newAccess, error: createAccessError } = await supabase
        .from('user_applications')
        .insert([{
          user_id: targetUserId,
          module_id: 'voice-isolation',
          module_title: 'Isolation Vocale par IA',
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
        // Rembourser les tokens en cas d'erreur (via API)
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user-tokens-simple`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: targetUserId,
            tokensToConsume: -requiredTokens, // Remboursement
            moduleId: 'voice-isolation',
            moduleName: 'Isolation Vocale par IA',
            action: 'voice-isolation.refund',
            description: 'Remboursement - Erreur création accès'
          })
        }).catch(() => {});
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

