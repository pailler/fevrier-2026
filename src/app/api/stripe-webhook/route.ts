import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '../../../utils/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.log('❌ Signature Stripe manquante');
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.log('❌ Erreur de signature webhook:', error);
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 400 }
      );
    }

    console.log('🔔 Événement Stripe reçu:', event.type);

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log('ℹ️ Événement non géré:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Session de paiement complétée:', session.id);

  if (session.payment_status !== 'paid') {
    console.log('⚠️ Paiement non complété:', session.payment_status);
    return;
  }

  const moduleId = session.metadata?.moduleId;
  const moduleTitle = session.metadata?.moduleTitle;
  const customerEmail = session.metadata?.customerEmail;
  const isTestMode = session.metadata?.testMode === 'true';

  if (!moduleId || !moduleTitle || !customerEmail) {
    console.log('❌ Métadonnées manquantes:', session.metadata);
    return;
  }

  console.log('🔄 Activation du module via webhook:', {
    moduleId,
    moduleTitle,
    customerEmail,
    isTestMode
  });

  // Récupérer l'utilisateur par email
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', customerEmail)
    .single();

  if (userError || !userData) {
    console.log('❌ Utilisateur non trouvé:', customerEmail);
    return;
  }

  // Vérifier si l'utilisateur a déjà accès à ce module
  const { data: existingAccess } = await supabase
    .from('user_applications')
    .select('*')
    .eq('user_id', userData.id)
    .eq('module_id', moduleId)
    .eq('is_active', true)
    .single();

  if (existingAccess) {
    console.log('ℹ️ Module déjà activé pour l\'utilisateur');
    return;
  }

  // Activer le module
  const now = new Date();
  const expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const { data: activationData, error: activationError } = await supabase
    .from('user_applications')
    .insert([
      {
        user_id: userData.id,
        module_id: moduleId,
        module_title: moduleTitle,
        is_active: true,
        access_level: 'paid',
        usage_count: 0,
        max_usage: 50,
        expires_at: expiresAt.toISOString(),
      }
    ])
    .select()
    .single();

  if (activationError) {
    console.error('❌ Erreur lors de l\'activation:', activationError);
    return;
  }

  console.log('✅ Module activé avec succès via webhook:', activationData);

  // Envoyer une notification
  try {
    const { NotificationService } = await import('../../../utils/notificationService');
    const notificationService = NotificationService.getInstance();
    
    await notificationService.notifyAppAccessed(
      customerEmail,
      moduleTitle,
      customerEmail.split('@')[0] || 'Utilisateur'
    );
  } catch (notificationError) {
    console.error('Erreur lors de l\'envoi de la notification:', notificationError);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('✅ Paiement réussi:', paymentIntent.id);
  // Logique supplémentaire si nécessaire
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Paiement échoué:', paymentIntent.id);
  // Logique de gestion d'échec si nécessaire
}
