import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug - API create-payment-intent appelée');
    
    // Vérifier la clé Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ Erreur - STRIPE_SECRET_KEY manquante');
      return NextResponse.json(
        { error: 'Configuration Stripe manquante' },
        { status: 500 }
      );
    }

    console.log('🔍 Debug - STRIPE_SECRET_KEY existe:', !!process.env.STRIPE_SECRET_KEY);
    console.log('🔍 Debug - STRIPE_SECRET_KEY commence par:', process.env.STRIPE_SECRET_KEY?.substring(0, 7));

    // Initialiser Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    });
    
    const body = await request.json();
    const { items, customerEmail, type } = body;

    console.log('🔍 Debug - Création session Stripe:', { items, customerEmail, type });
    console.log('🔍 Debug - Body complet:', body);

    if (!customerEmail) {
      console.error('❌ Erreur - Email client manquant');
      return NextResponse.json(
        { error: 'Email client requis' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      console.error('❌ Erreur - Items manquants');
      return NextResponse.json(
        { error: 'Items requis' },
        { status: 400 }
      );
    }

    // Calculer le montant total à partir des items
    const totalAmount = items.reduce((total: number, item: any) => total + (item.price || 0), 0);
    
    if (totalAmount <= 0) {
      console.error('❌ Erreur - Montant total invalide:', totalAmount);
      return NextResponse.json(
        { error: 'Montant total invalide' },
        { status: 400 }
      );
    }

    console.log('🔍 Debug - Validation OK, création session...');
    console.log('🔍 Debug - Montant total:', totalAmount);
    console.log('🔍 Debug - Items:', items.map((item: any) => ({ title: item.title, price: item.price })));

    // Vérifier l'URL de l'application - FORCÉE pour la production
    const appUrl = 'https://iahome.fr';
    console.log('🔍 Debug - URL de l\'application (FORCÉE):', appUrl);
    
    // S'assurer que l'URL est valide pour Stripe
    const baseUrl = appUrl.replace(/\/$/, ''); // Supprimer le slash final s'il existe
    console.log('🔍 Debug - Base URL pour Stripe:', baseUrl);

    // Préparer les métadonnées limitées (max 500 caractères)
    const limitedItems = items.map((item: any) => ({
      id: item.id,
      title: item.title?.substring(0, 50) || 'Module IA', // Limiter le titre
      price: item.price || 0
    }));

    const metadata = {
      customer_email: customerEmail,
      items_count: items.length.toString(),
      total_amount: totalAmount.toString(),
      type: type || 'payment',
      // Stocker seulement les IDs des items pour éviter de dépasser la limite
      items_ids: items.map((item: any) => item.id).join(',')
    };

    console.log('🔍 Debug - Métadonnées:', metadata);

    // Créer une session de paiement avec les métadonnées limitées
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.title || 'Module IA',
            description: item.description?.substring(0, 100) || 'Module d\'intelligence artificielle',
          },
          unit_amount: Math.round((item.price || 0) * 100), // Convertir en centimes
        },
        quantity: 1,
      })),
      mode: type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${baseUrl}/stripe-return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/stripe-return?canceled=true`,
      customer_email: customerEmail,
      metadata: metadata,
    });

    console.log('🔍 Debug - Session créée:', session.id);
    console.log('🔍 Debug - URL session:', session.url);
    console.log('🔍 Debug - Success URL (FORCÉE):', `${baseUrl}/stripe-return?session_id={CHECKOUT_SESSION_ID}`);
    console.log('🔍 Debug - Cancel URL (FORCÉE):', `${baseUrl}/stripe-return?canceled=true`);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Erreur création session Stripe:', error);
    
    // Log plus détaillé de l'erreur
    if (error instanceof Error) {
      console.error('❌ Message d\'erreur:', error.message);
      console.error('❌ Stack trace:', error.stack);
    }
    
    // Vérifier si c'est une erreur Stripe
    if (error && typeof error === 'object' && 'type' in error) {
      console.error('❌ Type d\'erreur Stripe:', (error as any).type);
      console.error('❌ Code d\'erreur Stripe:', (error as any).code);
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de la session',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 
