import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Configuration des packages de tokens
const TOKEN_PACKAGES = {
  discovery: {
    name: 'Pack Découverte',
    price: 499, // 4,99€ en centimes
    originalPrice: 800, // 8,00€ prix normal
    tokens: 1500,
    pricePerToken: 0.00333,
    description: 'Idéal pour les petits projets',
    isPromo: true
  },
  standard: {
    name: 'Pack Standard',
    price: 1499, // 14,99€ en centimes
    originalPrice: 1999, // 19,99€ prix normal
    tokens: 8000,
    pricePerToken: 0.00187,
    description: 'Le plus populaire',
    isPromo: true
  },
  pro: {
    name: 'Pack Entreprise',
    price: 4999, // 49,99€ en centimes
    originalPrice: 6000, // 60,00€ prix normal
    tokens: 30000,
    pricePerToken: 0.00167,
    description: 'Pour les utilisateurs avancés',
    isPromo: true
  }
};

export async function POST(request: NextRequest) {
  try {
    // Vérifier la configuration Stripe
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      console.error('❌ STRIPE_SECRET_KEY manquante. Vérifiez le fichier d’env du conteneur.');
      return NextResponse.json(
        {
          error: 'Clés Stripe manquantes',
          details: 'STRIPE_SECRET_KEY n’est pas définie. En Docker : vérifiez env_file dans docker-compose (.env.production.local).',
        },
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
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `${packageData.name} - ${packageData.tokens} tokens`,
          footer: 'IA Home - iahome.fr',
        },
      },
      payment_intent_data: {
        description: `${packageData.name} - ${packageData.tokens} tokens`,
      },
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
