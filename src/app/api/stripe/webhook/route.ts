import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripeServer } from '@/utils/stripeServer';
import { supabase } from '../../../../utils/supabaseClient';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Webhook Stripe reçu');
    
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    console.log('📝 Signature reçue:', signature ? 'Oui' : 'Non');
    console.log('📦 Body length:', body.length);

    let event: Stripe.Event;

    try {
      const stripe = getStripeServer();
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ Événement Stripe validé:', event.type);
    } catch (err) {
      console.error('❌ Erreur signature webhook:', err);
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 400 }
      );
    }

    // Traiter l'événement de paiement réussi
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('✅ Paiement réussi:', session.id);
      console.log('📧 Email:', session.customer_email);
      console.log('📦 Package:', session.metadata?.packageType);
      console.log('🪙 Tokens:', session.metadata?.tokens);

      const userId = session.metadata?.userId;
      const userEmail = session.customer_email || session.metadata?.userEmail;
      const packageType = session.metadata?.packageType;
      const tokens = parseInt(session.metadata?.tokens || '0');

      if (!userEmail || !tokens) {
        console.error('❌ Données manquantes dans les métadonnées');
        return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
      }

      // Ajouter les tokens à l'utilisateur
      await addTokensToUser(userEmail, tokens, packageType, session.id);

      // Enregistrer la transaction
      await recordTransaction(session, packageType, tokens);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Erreur webhook Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

async function addTokensToUser(userEmail: string, tokens: number, packageType: string, sessionId: string) {
  try {
    // Récupérer l'utilisateur par email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (profileError || !profile) {
      console.error('❌ Utilisateur non trouvé:', userEmail);
      return;
    }

    // Vérifier si l'utilisateur a déjà des tokens
    const { data: existingTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', profile.id)
      .single();

    if (tokensError && tokensError.code !== 'PGRST116') {
      console.error('❌ Erreur récupération tokens:', tokensError);
      return;
    }

    const currentTokens = existingTokens?.tokens || 0;
    const newTokenCount = currentTokens + tokens;

    // Mettre à jour les tokens
    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({
        tokens: newTokenCount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.id);

    if (updateError) {
      console.error('❌ Erreur mise à jour tokens:', updateError);
    } else {
      console.log(`✅ Tokens ajoutés: ${tokens} pour ${userEmail} (Total: ${newTokenCount})`);
    }

  } catch (error) {
    console.error('❌ Erreur addTokensToUser:', error);
  }
}

async function recordTransaction(session: Stripe.Checkout.Session, packageType: string, tokens: number) {
  try {
    const { error } = await supabase
      .from('stripe_transactions')
      .insert({
        session_id: session.id,
        user_email: session.customer_email,
        package_type: packageType,
        tokens_purchased: tokens,
        amount_paid: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Erreur enregistrement transaction:', error);
    } else {
      console.log('✅ Transaction enregistrée:', session.id);
    }

  } catch (error) {
    console.error('❌ Erreur recordTransaction:', error);
  }
}
