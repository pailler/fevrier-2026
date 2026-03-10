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

    // Lister tous les codes (actifs et inactifs) pour donner un message clair si inactif
    // Pagination au cas où il y aurait plus de 100 codes
    let match: { code?: string; active?: boolean; coupon?: string | object; id?: string } | null = null;
    let hasMore = true;
    let startingAfter: string | undefined;
    while (hasMore) {
      const params: { limit: number; starting_after?: string } = { limit: 100 };
      if (startingAfter) params.starting_after = startingAfter;
      const { data: list, has_more } = await stripe.promotionCodes.list(params);
      match = list.find((p) => (p.code || '').toUpperCase() === code) || null;
      if (match) break;
      hasMore = !!has_more && list.length > 0;
      if (hasMore) startingAfter = list[list.length - 1]?.id;
    }

    if (!match || !match.coupon) {
      const hint = code === 'BIENVENUE2026'
        ? ' Un administrateur doit d\'abord le créer : Admin > Codes promo > bouton « BIENVENUE2026 (-20%) ».'
        : '';
      return NextResponse.json(
        { valid: false, error: `Code invalide ou expiré.${hint}` },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' },
        }
      );
    }
    if (!match.active) {
      return NextResponse.json({
        valid: false,
        error: 'Ce code promo est actuellement inactif. Un administrateur doit l\'activer.',
      }, { status: 200 });
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
