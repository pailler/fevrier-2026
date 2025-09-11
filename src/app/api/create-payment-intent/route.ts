import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialiser Stripe avec la clé secrète (peut être test ou production selon l'environnement)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerEmail, type, testMode = false } = body;

    // Déterminer si on est en mode production ou test
    const isProductionMode = process.env.STRIPE_MODE === 'production' && !testMode;
    const isTestMode = !isProductionMode || testMode;

    console.log('🔍 Mode de paiement:', isProductionMode ? 'PRODUCTION' : 'TEST');

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items requis pour créer la session de paiement' },
        { status: 400 }
      );
    }

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Email client requis' },
        { status: 400 }
      );
    }

    // Créer les line items pour Stripe
    const lineItems = items.map((item: any) => {
      const originalPrice = item.price || 0;
      // Stripe a un minimum de 50 centimes, on utilise le maximum entre le prix original et 0.50€
      const stripeAmount = Math.max(originalPrice, 0.50);
      
      console.log('💰 Prix configuré:', {
        module: item.title,
        originalPrice: originalPrice,
        stripeAmount: stripeAmount,
        unitAmount: Math.round(stripeAmount * 100)
      });
      
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.title || 'Module IA',
            description: item.description || 'Accès au module IA',
            images: item.image_url ? [item.image_url] : [],
          },
          unit_amount: Math.round(stripeAmount * 100), // Stripe utilise les centimes
        },
        quantity: 1,
      };
    });

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://iahome.fr'}/payment-success?session_id={CHECKOUT_SESSION_ID}&test_mode=${isTestMode}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://iahome.fr'}/payment-cancel`,
      customer_email: customerEmail,
      metadata: {
        moduleId: items[0]?.id || '',
        moduleTitle: items[0]?.title || '',
        customerEmail: customerEmail,
        testMode: isTestMode.toString(),
        environment: isProductionMode ? 'production' : 'test',
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'CA'],
      },
    });

    console.log('✅ Session Stripe créée:', {
      sessionId: session.id,
      mode: isProductionMode ? 'PRODUCTION' : 'TEST',
      amount: session.amount_total,
      module: items[0]?.title
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      testMode: isTestMode,
      productionMode: isProductionMode,
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de la session de paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
