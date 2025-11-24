import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Configuration des packages de tokens
const TOKEN_PACKAGES = {
  discovery: {
    name: 'Pack Découverte',
    price: 999, // 9,99€ en centimes (PROMO)
    originalPrice: 1200, // 12,00€ prix normal
    tokens: 1500,
    pricePerToken: 0.0066,
    description: 'Idéal pour les petits projets',
    isPromo: true
  },
  standard: {
    name: 'Pack Standard',
    price: 1999, // 19,99€ en centimes (PROMO)
    originalPrice: 2400, // 24,00€ prix normal
    tokens: 5000,
    pricePerToken: 0.004,
    description: 'Le plus populaire',
    isPromo: true
  },
  pro: {
    name: 'Pack Pro',
    price: 5999, // 59,99€ en centimes (PROMO)
    originalPrice: 7500, // 75,00€ prix normal
    tokens: 20000,
    pricePerToken: 0.003,
    description: 'Pour les utilisateurs avancés',
    isPromo: true
  }
};

export async function POST(request: NextRequest) {
  try {
    // Vérifier la configuration Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY manquante');
      return NextResponse.json(
        { error: 'Configuration Stripe manquante' },
        { status: 500 }
      );
    }

    const { packageType, userId, userEmail } = await request.json();
    
    console.log('🔄 Création session Stripe:', { packageType, userId, userEmail });

    if (!packageType || !TOKEN_PACKAGES[packageType as keyof typeof TOKEN_PACKAGES]) {
      console.error('❌ Package invalide:', packageType);
      return NextResponse.json(
        { error: 'Package invalide' },
        { status: 400 }
      );
    }

    const packageData = TOKEN_PACKAGES[packageType as keyof typeof TOKEN_PACKAGES];
    console.log('📦 Package sélectionné:', packageData);

    // Définir l'URL de base
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iahome.fr';
    console.log('🌐 URL de base:', baseUrl);

    // Créer la session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: packageData.name,
              description: `${packageData.tokens} tokens - ${packageData.description}`,
            },
            unit_amount: packageData.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/payment-success?package=${packageType}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        userId: userId || '',
        userEmail: userEmail || '',
        packageType,
        tokens: packageData.tokens.toString(),
      },
      customer_email: userEmail,
    });

    console.log('✅ Session créée:', session.id);

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Erreur création session Stripe:', error);
    
    // Log plus détaillé de l'erreur
    if (error instanceof Error) {
      console.error('❌ Message d\'erreur:', error.message);
      console.error('❌ Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
