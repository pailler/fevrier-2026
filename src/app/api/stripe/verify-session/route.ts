import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '../../../../utils/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

/**
 * Endpoint pour vérifier manuellement une session Stripe
 * Utile si le webhook n'a pas été reçu
 * 
 * Usage: POST /api/stripe/verify-session
 * Body: { sessionId: "cs_live_..." }
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId requis' },
        { status: 400 }
      );
    }

    console.log('🔍 Vérification manuelle de la session:', sessionId);

    // Récupérer la session depuis Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    console.log('📋 Détails de la session:', {
      id: session.id,
      mode: session.mode,
      payment_status: session.payment_status,
      status: session.status,
      amount_total: session.amount_total,
      customer_email: session.customer_email,
      metadata: session.metadata
    });

    // Vérifier si le paiement est complété
    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        verified: false,
        reason: 'Paiement non complété',
        payment_status: session.payment_status,
        status: session.status
      });
    }

    // Récupérer l'email
    const customerEmail = session.metadata?.userEmail || session.metadata?.customerEmail || session.customer_email;

    if (!customerEmail) {
      return NextResponse.json({
        verified: false,
        reason: 'Email client manquant',
        metadata: session.metadata
      });
    }

    // Trouver l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', customerEmail)
      .single();

    if (userError || !userData) {
      return NextResponse.json({
        verified: false,
        reason: 'Utilisateur non trouvé',
        email: customerEmail
      });
    }

    // Vérifier si les tokens ont déjà été crédités
    const { data: tokensData, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', userData.id)
      .single();

    const currentTokens = tokensData?.tokens || 0;

    // Vérifier si une transaction existe déjà
    const { data: transactionData, error: transactionError } = await supabase
      .from('user_credit_transactions')
      .select('*')
      .eq('stripe_invoice_id', session.id)
      .single();

    const hasTransaction = !transactionError && transactionData;

    // Si c'est un abonnement et que les tokens n'ont pas été crédités, les créditer
    if (session.mode === 'subscription' && !hasTransaction) {
      const packageType = session.metadata?.packageType || 'subscription_monthly';
      const tokens = parseInt(session.metadata?.tokens || '3000');
      const subscriptionId = session.subscription as string;

      console.log('🔄 Crédit manuel des tokens pour la session:', {
        userId: userData.id,
        email: customerEmail,
        tokens,
        packageType,
        subscriptionId
      });

      // Créditer les tokens (REMPLACEMENT pour abonnement)
      const { error: updateError } = await supabase
        .from('user_tokens')
        .upsert({
          user_id: userData.id,
          tokens: tokens,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (updateError) {
        console.error('❌ Erreur crédit tokens:', updateError);
        return NextResponse.json({
          verified: false,
          reason: 'Erreur crédit tokens',
          error: updateError.message
        });
      }

      // Enregistrer la transaction
      const { error: transactionInsertError } = await supabase
        .from('user_credit_transactions')
        .insert({
          user_id: userData.id,
          transaction_type: 'subscription_initial',
          amount: (session.amount_total || 0) / 100,
          tokens: tokens,
          stripe_invoice_id: session.id,
          stripe_subscription_id: subscriptionId,
          package_type: packageType,
          description: `Abonnement initial - ${tokens} tokens (vérification manuelle)`,
          created_at: new Date().toISOString()
        });

      if (transactionInsertError) {
        console.error('❌ Erreur enregistrement transaction:', transactionInsertError);
      }

      return NextResponse.json({
        verified: true,
        action: 'tokens_credited',
        tokens_credited: tokens,
        previous_tokens: currentTokens,
        new_tokens: tokens,
        user_email: customerEmail
      });
    }

    // Prestation / Photobooth : enregistrer la transaction si le webhook n'est pas encore passé
    const pkg = session.metadata?.packageType;
    const isProductPayment =
      pkg === 'photobooth_personalized' || pkg === 'prestation_marketing';
    if (session.mode === 'payment' && isProductPayment && !hasTransaction) {
      const desc =
        pkg === 'prestation_marketing'
          ? 'Prestation développement — commande (vérification manuelle)'
          : 'Photobooth personnalisé — commande (vérification manuelle)';
      const { error: insertErr } = await supabase.from('user_credit_transactions').insert({
        user_id: userData.id,
        transaction_type: 'product_purchase',
        amount: (session.amount_total || 0) / 100,
        tokens: 0,
        stripe_invoice_id: session.id,
        package_type: pkg,
        description: desc,
        created_at: new Date().toISOString(),
      });
      if (insertErr) {
        console.error('❌ verify-session produit insert:', insertErr);
      }
      return NextResponse.json({
        verified: true,
        action: 'product_recorded',
        user_email: customerEmail,
        amount_total: (session.amount_total || 0) / 100,
        package_type: pkg,
      });
    }

    return NextResponse.json({
      verified: true,
      action: 'already_processed',
      current_tokens: currentTokens,
      has_transaction: hasTransaction,
      user_email: customerEmail,
      session: {
        id: session.id,
        mode: session.mode,
        payment_status: session.payment_status,
        status: session.status
      }
    });

  } catch (error) {
    console.error('❌ Erreur vérification session:', error);
    return NextResponse.json(
      { 
        verified: false,
        reason: 'Erreur interne',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
