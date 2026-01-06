import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialiser Stripe avec la clé secrète (peut être test ou production selon l'environnement)
let stripe: Stripe;
try {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-08-27.basil',
  });
  ;
} catch (error) {
  console.error('❌ Erreur initialisation Stripe:', error);
  throw error;
}

export async function POST(request: NextRequest) {
  try {
    ;
    
    const body = await request.json();
    console.log('🔍 API create-payment-intent: Body reçu:', JSON.stringify(body, null, 2));
    
    const { 
      items, 
      customerEmail, 
      type, 
      testMode = false,
      // Nouveau format pour les modules individuels
      moduleId,
      userId,
      amount,
      currency = 'eur',
      moduleTitle,
      moduleDescription,
      moduleCategory,
      moduleUrl,
      // Support pour l'achat de tokens
      tokenPackage,
      tokens
    } = body;

    // Déterminer si on est en mode production ou test
    const isProductionMode = process.env.STRIPE_MODE === 'production' && !testMode;
    const isTestMode = !isProductionMode || testMode;

    ;
    console.log('🔍 Clé Stripe configurée:', !!process.env.STRIPE_SECRET_KEY);
    console.log('🔍 Clé Stripe (premiers caractères):', process.env.STRIPE_SECRET_KEY?.substring(0, 10));

    // Support pour l'achat de tokens
    console.log('🔍 Vérification des conditions token_purchase:', {
      type,
      hasTokenPackage: !!tokenPackage,
      tokens,
      userId,
      condition: type === 'token_purchase' && tokenPackage && tokens && userId
    });
    
    if (type === 'token_purchase' && tokenPackage && tokens && userId) {
      console.log('🔍 Création de session Stripe pour tokens:', {
        tokenPackage,
        tokens,
        userId,
        customerEmail
      });
      
      const lineItems = [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${tokenPackage.name} - ${moduleTitle || 'Tokens'}`,
            description: `${tokens} tokens pour ${moduleTitle || 'modules payants'}`,
          },
          unit_amount: Math.round(tokenPackage.price * 100), // Convertir en centimes
        },
        quantity: 1,
      }];

      console.log('🔍 Line items créés:', lineItems);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://iahome.fr'}/payment-success?session_id={CHECKOUT_SESSION_ID}&test_mode=${isTestMode}&type=token_purchase`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://iahome.fr'}/payment-cancel`,
        customer_email: customerEmail,
        metadata: {
          type: 'token_purchase',
          moduleId: moduleId || '',
          moduleTitle: moduleTitle || '',
          userId: userId,
          customerEmail: customerEmail,
          tokenPackage: JSON.stringify(tokenPackage),
          tokens: tokens.toString(),
          testMode: isTestMode.toString(),
          environment: isProductionMode ? 'production' : 'test',
        },
        billing_address_collection: 'required',
      });

      console.log('✅ Session Stripe créée (tokens):', {
        sessionId: session.id,
        mode: isProductionMode ? 'PRODUCTION' : 'TEST',
        amount: session.amount_total,
        tokens: tokens,
        package: tokenPackage.name
      });

      return NextResponse.json({
        clientSecret: session.client_secret,
        url: session.url,
        sessionId: session.id,
        testMode: isTestMode,
        productionMode: isProductionMode,
      });
    }

    // Support du nouveau format pour les modules individuels
    if (moduleId && userId && amount) {
      const lineItems = [{
        price_data: {
          currency: currency,
          product_data: {
            name: moduleTitle || 'Module IA',
            description: moduleDescription || 'Accès au module IA',
          },
          unit_amount: Math.round(amount), // amount est déjà en centimes
        },
        quantity: 1,
      }];

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://iahome.fr'}/payment-success?session_id={CHECKOUT_SESSION_ID}&test_mode=${isTestMode}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://iahome.fr'}/payment-cancel`,
        customer_email: customerEmail,
        metadata: {
          moduleId: moduleId,
          moduleTitle: moduleTitle || '',
          userId: userId,
          customerEmail: customerEmail,
          testMode: isTestMode.toString(),
          environment: isProductionMode ? 'production' : 'test',
        },
        billing_address_collection: 'required',
      });

      console.log('✅ Session Stripe créée (module individuel):', {
        sessionId: session.id,
        mode: isProductionMode ? 'PRODUCTION' : 'TEST',
        amount: session.amount_total,
        module: moduleTitle
      });

      return NextResponse.json({
        clientSecret: session.client_secret,
        url: session.url,
        sessionId: session.id,
        testMode: isTestMode,
        productionMode: isProductionMode,
      });
    }

    // Format original pour les items multiples
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
