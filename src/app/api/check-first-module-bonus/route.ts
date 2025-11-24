import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

/**
 * Vérifie si un utilisateur est éligible aux 200 tokens bonus
 * et les ajoute si c'est le cas
 * Conditions :
 * - C'est la première activation de module pour cet utilisateur
 * - L'utilisateur s'est inscrit dans les 3 derniers jours
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }

    console.log(`🎁 Vérification bonus premier module pour ${userEmail || userId}`);

    // 1. Vérifier si c'est la première activation de module
    const { data: existingModules, error: modulesError } = await supabase
      .from('user_applications')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (modulesError && modulesError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la vérification des modules:', modulesError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification' },
        { status: 500 }
      );
    }

    // Si l'utilisateur a déjà activé un module avant, pas de bonus
    if (existingModules && existingModules.length > 0) {
      const firstActivation = new Date(existingModules[0].created_at);
      const now = new Date();
      const timeDiff = now.getTime() - firstActivation.getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      // Si le premier module a été activé il y a plus de quelques secondes (c'est-à-dire pas maintenant)
      // et que ce n'est pas la première activation, pas de bonus
      if (timeDiff > 5000) { // Plus de 5 secondes = ce n'est pas la première activation maintenant
        console.log(`⚠️ L'utilisateur a déjà activé un module auparavant, pas de bonus`);
        return NextResponse.json({
          success: false,
          eligible: false,
          reason: 'Module déjà activé auparavant'
        });
      }
    }

    // 2. Vérifier la date d'inscription de l'utilisateur
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, created_at')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      console.error('❌ Utilisateur non trouvé:', userId);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const signupDate = new Date(userProfile.created_at);
    const now = new Date();
    const timeDiff = now.getTime() - signupDate.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    // Vérifier si l'inscription date de moins de 3 jours
    if (daysDiff > 3) {
      console.log(`⚠️ Inscription il y a ${daysDiff.toFixed(1)} jours, délai de 3 jours dépassé`);
      return NextResponse.json({
        success: false,
        eligible: false,
        reason: 'Délai de 3 jours dépassé',
        daysSinceSignup: daysDiff.toFixed(1)
      });
    }

    // 3. Vérifier si le bonus a déjà été attribué
    // On peut utiliser un champ dans user_tokens ou créer une table de suivi
    // Pour simplifier, on vérifie dans les logs de notification ou on crée un flag
    const { data: bonusLog, error: bonusLogError } = await supabase
      .from('notification_logs')
      .select('id')
      .eq('user_email', userEmail || '')
      .eq('event_type', 'first_module_bonus')
      .single();

    if (bonusLog && !bonusLogError) {
      console.log(`⚠️ Bonus déjà attribué à cet utilisateur`);
      return NextResponse.json({
        success: false,
        eligible: false,
        reason: 'Bonus déjà attribué'
      });
    }

    // 4. Ajouter les 200 tokens bonus
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens, package_name, purchase_date')
      .eq('user_id', userId)
      .single();

    const currentTokens = userTokens?.tokens || 0;
    const newTokenCount = currentTokens + 200;

    const { error: updateError } = await supabase
      .from('user_tokens')
      .upsert([{
        user_id: userId,
        tokens: newTokenCount,
        package_name: (userTokens as any)?.package_name || 'First Module Bonus',
        purchase_date: (userTokens as any)?.purchase_date || new Date().toISOString(),
        is_active: true,
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('❌ Erreur lors de l\'ajout des tokens bonus:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout des tokens bonus' },
        { status: 500 }
      );
    }

    // 5. Enregistrer le log du bonus
    if (userEmail) {
      await supabase
        .from('notification_logs')
        .insert({
          event_type: 'first_module_bonus',
          user_email: userEmail,
          event_data: {
            bonus_tokens: 200,
            signup_date: userProfile.created_at,
            activation_date: new Date().toISOString()
          },
          email_sent: false,
          email_sent_at: null
        });
    }

    console.log(`✅ 200 tokens bonus ajoutés pour ${userEmail || userId}`);
    console.log(`🪙 Tokens avant: ${currentTokens}, Tokens après: ${newTokenCount}`);

    return NextResponse.json({
      success: true,
      eligible: true,
      bonusTokens: 200,
      previousTokens: currentTokens,
      newTotalTokens: newTokenCount,
      daysSinceSignup: daysDiff.toFixed(1)
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du bonus:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

