import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

/**
 * GET ?code=BIENVENUE10
 * Valide un code promo et retourne percent_off + promotion_code_id pour le checkout.
 * Public (pas d'auth) : le code lui-même est le secret.
 */
export async function GET(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      return NextResponse.json({ valid: false, error: 'Stripe non configuré' }, { status: 500 });
    }

    const code = request.nextUrl.searchParams.get('code')?.trim()?.toUpperCase();
    if (!code) {
      return NextResponse.json({ valid: false, error: 'Code manquant' }, { status: 400 });
    }

    const { data: list } = await stripe.promotionCodes.list({ limit: 100, active: true });
    const match = list.find((p) => (p.code || '').toUpperCase() === code);
    if (!match || !match.coupon) {
      return NextResponse.json({ valid: false, error: 'Code invalide ou expiré' }, { status: 200 });
    }

    const coupon = typeof match.coupon === 'object' ? match.coupon : await stripe.coupons.retrieve(match.coupon as string);
    const percentOff = coupon && 'percent_off' in coupon ? coupon.percent_off : null;
    const amountOff = coupon && 'amount_off' in coupon ? (coupon as { amount_off: number }).amount_off : null;

    return NextResponse.json({
      valid: true,
      promotion_code_id: match.id,
      percent_off: percentOff,
      amount_off: amountOff != null ? amountOff / 100 : null,
      code: match.code,
    });
  } catch (error) {
    console.error('❌ validate-promo:', error);
    return NextResponse.json(
      { valid: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
