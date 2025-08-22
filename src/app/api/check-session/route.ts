import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Vérifier si la clé Stripe est disponible
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-07-30.basil',
}) : null;

export async function POST(request: NextRequest) {
  try {
    // Vérifier si Stripe est configuré
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe non configuré' },
        { status: 503 }
      );
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId requis' },
        { status: 400 }
      );
    }

    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          status: session.status,
          payment_status: session.payment_status,
          customer_email: session.customer_email,
          amount_total: session.amount_total,
          metadata: session.metadata
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Paiement non complété',
        session: {
          id: session.id,
          status: session.status,
          payment_status: session.payment_status
        }
      }, { status: 400 });
    }

  } catch (error) {
    if (error instanceof Error && error.message.includes('No such checkout.session')) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 