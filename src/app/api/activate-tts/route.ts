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

    console.log('🔄 Activation TTS pour l\'utilisateur:', userId);

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
          error: `Crédits insuffisants. Vous avez ${currentTokens} crédits, ${requiredTokens} crédits sont requis.` 
        }, { status: 400 });
      }
    }

    const tokensData = await tokensResponse.json().catch(() => ({ tokensRemaining: 0 }));
    const currentTokens = tokensData.tokensRemaining || tokensData.tokens || 0;

    if (currentTokens < requiredTokens) {
      console.log(`❌ Crédits insuffisants: ${currentTokens} < ${requiredTokens}`);
      return NextResponse.json({ 
        success: false, 
        error: `Crédits insuffisants. Vous avez ${currentTokens} crédits, ${requiredTokens} crédits sont requis.` 
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
        moduleId: 'tts',
        moduleName: 'Synthèse vocale IA (TTS)',
        action: 'tts.activate',
        description: 'Activation de l\'application Synthèse vocale IA (TTS)'
      })
    });

    if (!consumeResponse.ok) {
      const consumeError = await consumeResponse.json().catch(() => ({}));
      console.error('❌ Erreur consommation tokens:', consumeError);
      return NextResponse.json({ 
        success: false, 
        error: consumeError.message || 'Erreur lors de la consommation des crédits' 
      }, { status: 500 });
    }

    const consumeResult = await consumeResponse.json();
    const newTokenBalance = consumeResult.tokensRemaining || (currentTokens - requiredTokens);

    console.log(`✅ ${requiredTokens} tokens consommés. Nouveau solde: ${newTokenBalance}`);

    // 3. Vérifier si le module TTS existe, sinon le créer
    let { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, price, is_visible')
      .eq('id', 'tts')
      .single();

    if (moduleError || !moduleData) {
      console.log('⚠️ Module TTS non trouvé, création du module...');
      
      // Créer le module dans la table modules
      const newModuleData = {
        id: 'tts',
        title: 'Synthèse vocale IA (TTS)',
        description: 'Convertissez du texte en voix naturelle avec Coqui XTTS v2 : 58 voix, 17 langues, clonage vocal, export WAV/MP3. Synthèse vocale open source haute qualité.',
        category: 'IA Audio',
        price: 100,
        url: '/card/tts',
        image_url: '/images/whisper.jpg',
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
            moduleId: 'tts',
            moduleName: 'Synthèse vocale IA (TTS)',
            action: 'tts.refund',
            description: 'Remboursement - Erreur création module'
          })
        }).catch(() => {});
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la création du module TTS' 
        }, { status: 500 });
      }

      moduleData = createdModule;
      console.log('✅ Module TTS créé avec succès:', moduleData.id);
    } else {
      // S'assurer que le module est visible
      if (moduleData.is_visible === false) {
        console.log('⚠️ Module TTS existe mais n\'est pas visible, mise à jour...');
        const { error: updateError } = await supabase
          .from('modules')
          .update({ is_visible: true, updated_at: new Date().toISOString() })
          .eq('id', 'tts');

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour de la visibilité:', updateError);
        } else {
          console.log('✅ Visibilité du module TTS mise à jour');
        }
      }
      console.log('✅ Module TTS trouvé:', moduleData.id);
    }

    const { data: existingAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, usage_count')
      .eq('user_id', targetUserId)
      .eq('module_id', 'tts')
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
          moduleId: 'tts',
          moduleName: 'Synthèse vocale IA (TTS)',
          action: 'tts.refund',
          description: 'Remboursement - Déjà enregistré'
        })
      }).catch(() => {});
      return NextResponse.json({
        success: true,
        message: 'TTS déjà enregistré sur ce compte',
        accessId: existingAccess.id,
        moduleId: 'tts',
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
            moduleId: 'tts',
            moduleName: 'Synthèse vocale IA (TTS)',
            action: 'tts.refund',
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
          module_id: 'tts',
          module_title: 'Synthèse vocale IA (TTS)',
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
            moduleId: 'tts',
            moduleName: 'Synthèse vocale IA (TTS)',
            action: 'tts.refund',
            description: 'Remboursement - Erreur création accès'
          })
        }).catch(() => {});
        return NextResponse.json({ 
          success: false, 
          error: 'Erreur lors de la création de l\'accès' 
        }, { status: 500 });
      }

      accessData = newAccess;
      console.log('✅ Accès TTS créé avec succès:', accessData.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Accès à TTS ouvert sur votre compte',
      accessId: accessData.id,
      moduleId: 'tts',
      tokensConsumed: requiredTokens,
      remainingTokens: newTokenBalance
    });

  } catch (error) {
    console.error('❌ Erreur activation TTS:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

