import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

/**
 * API pour créditer les tokens d'abonnement (REMPLACEMENT, pas addition)
 * Utilisé pour corriger les abonnements où les tokens n'ont pas été crédités
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail, tokens, packageType, subscriptionId } = await request.json();
    
    console.log('🔄 Crédit tokens abonnement:', { userEmail, tokens, packageType, subscriptionId });

    if (!userEmail || !tokens) {
      return NextResponse.json(
        { error: 'Email et tokens requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur par email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (profileError || !profile) {
      console.error('❌ Utilisateur non trouvé:', userEmail);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les tokens actuels pour logging
    const { data: existingTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', profile.id)
      .single();

    const previousTokens = existingTokens?.tokens || 0;

    console.log('🔄 Remplacement tokens abonnement:', {
      userEmail,
      previousTokens,
      newTokens: tokens,
      action: 'REMPLACEMENT (quota mensuel)'
    });

    // REMPLACER les tokens par le quota mensuel (pas d'accumulation)
    const { error: updateError } = await supabase
      .from('user_tokens')
      .upsert({
        user_id: profile.id,
        tokens: tokens, // REMPLACER par le quota mensuel (3000)
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('❌ Erreur mise à jour tokens:', updateError);
      return NextResponse.json(
        { error: 'Erreur mise à jour tokens' },
        { status: 500 }
      );
    }

    console.log(`✅ ${tokens} tokens crédités pour ${userEmail} (REMPLACEMENT)`);
    console.log(`   Tokens précédents: ${previousTokens} → Nouveaux tokens: ${tokens}`);

    // Enregistrer la transaction
    try {
      const { error: transactionError } = await supabase
        .from('user_credit_transactions')
        .insert({
          user_id: profile.id,
          transaction_type: 'subscription_initial',
          amount: 0, // Montant non disponible dans cette API
          tokens: tokens,
          stripe_subscription_id: subscriptionId || null,
          package_type: packageType || 'subscription_monthly',
          description: `Correction abonnement - ${tokens} tokens (crédit manuel)`,
          created_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error('❌ Erreur enregistrement transaction:', transactionError);
        // Ne pas bloquer le processus
      } else {
        console.log('✅ Transaction enregistrée dans user_credit_transactions');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de la transaction:', error);
      // Ne pas bloquer le processus
    }

    return NextResponse.json({
      success: true,
      message: `${tokens} tokens crédités (remplacement)`,
      previousTokens,
      newTokens: tokens,
      userEmail
    });

  } catch (error) {
    console.error('❌ Erreur crédit tokens abonnement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
