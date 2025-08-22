import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialiser Stripe avec la clé secrète (mode test)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerEmail, type, testMode = false } = body;

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

    // Mode test : simuler un paiement réussi
    if (testMode || process.env.NODE_ENV === 'development') {
      const moduleId = items[0]?.id || 'ruinedfooocus';
      const testSessionId = `cs_test_${moduleId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Redirection vers la page de succès avec un session_id de test
      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://iahome.fr'}/payment-success?session_id=${testSessionId}&test_mode=true`,
        sessionId: testSessionId,
        testMode: true
      });
    }

    // Créer les line items pour Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.title || 'Module IA',
          description: item.description || 'Accès au module IA',
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round((item.price || 0) * 100), // Stripe utilise les centimes
      },
      quantity: 1,
    }));

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://iahome.fr'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://iahome.fr'}/payment-cancel`,
      customer_email: customerEmail,
      metadata: {
        moduleId: items[0]?.id || '',
        moduleTitle: items[0]?.title || '',
        customerEmail: customerEmail,
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'CA'],
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
