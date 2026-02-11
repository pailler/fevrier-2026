import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

/** GET: liste des codes promo Stripe (actifs et inactifs) */
export async function GET() {
  try {
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      return NextResponse.json(
        { error: 'Stripe non configuré' },
        { status: 500 }
      );
    }

    const [promoCodesRes, couponsRes] = await Promise.all([
      stripe.promotionCodes.list({ limit: 100 }),
      stripe.coupons.list({ limit: 100 }),
    ]);

    const couponById = new Map(couponsRes.data.map((c) => [c.id, c]));

    const list = promoCodesRes.data.map((p) => {
      const coupon = p.coupon && typeof p.coupon === 'object' ? p.coupon : couponById.get(typeof p.coupon === 'string' ? p.coupon : '');
      const amountOff = coupon && 'amount_off' in coupon ? (coupon as Stripe.Coupon).amount_off : null;
      const percentOff = coupon && 'percent_off' in coupon ? (coupon as Stripe.Coupon).percent_off : null;
      return {
        id: p.id,
        code: p.code,
        active: p.active,
        created: p.created,
        expires_at: p.expires_at,
        max_redemptions: p.max_redemptions,
        times_redeemed: p.times_redeemed,
        amount_off: amountOff != null ? amountOff / 100 : null,
        percent_off: percentOff,
        currency: coupon && 'currency' in coupon ? (coupon as Stripe.Coupon).currency : null,
      };
    });

    return NextResponse.json({ promotion_codes: list });
  } catch (error) {
    console.error('❌ Erreur liste codes promo:', error);
    return NextResponse.json(
      {
        error: 'Erreur Stripe',
        details: error instanceof Error ? error.message : 'Inconnu',
      },
      { status: 500 }
    );
  }
}

/** POST: créer ou activer le code BIENVENUE10 (2€ de réduction) */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      return NextResponse.json(
        { error: 'Stripe non configuré' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action = 'ensure_bienvenue10', code, amount_off, percent_off } = body;

    if (action === 'ensure_bienvenue10') {
      const CODE = 'BIENVENUE10';
      const PERCENT_OFF = 20; // 20 % de remise

      const { data: existing } = await stripe.promotionCodes.list({ limit: 100 });
      const matching = existing.filter((p) => (p.code || '').toUpperCase() === CODE);

      // Vérifier si un code actif existe déjà avec 20 % de remise
      for (const p of matching) {
        if (p.active && p.coupon) {
          const coupon = typeof p.coupon === 'object' ? p.coupon : await stripe.coupons.retrieve(p.coupon as string);
          if (coupon && 'percent_off' in coupon && coupon.percent_off === PERCENT_OFF) {
            return NextResponse.json({
              ok: true,
              message: 'Le code BIENVENUE10 (20 % de remise) est déjà actif.',
              promotion_code_id: p.id,
              code: p.code,
            });
          }
        }
      }

      const inactiveCode = matching.find((p) => !p.active);
      if (inactiveCode) {
        const coupon = typeof inactiveCode.coupon === 'object' ? inactiveCode.coupon : await stripe.coupons.retrieve(inactiveCode.coupon as string);
        if (coupon && 'percent_off' in coupon && coupon.percent_off === PERCENT_OFF) {
          const updated = await stripe.promotionCodes.update(inactiveCode.id, { active: true });
          return NextResponse.json({
            ok: true,
            message: 'Code BIENVENUE10 (20 %) réactivé.',
            promotion_code_id: updated.id,
            code: updated.code,
          });
        }
      }

      let couponId: string | null = null;
      const couponsList = await stripe.coupons.list({ limit: 100 });
      const couponForBienvenue10 = couponsList.data.find(
        (c) => (c as Stripe.Coupon).percent_off === PERCENT_OFF && c.duration === 'once' && !c.redeem_by
      );
      if (couponForBienvenue10) {
        couponId = couponForBienvenue10.id;
      } else {
        const coupon = await stripe.coupons.create({
          percent_off: PERCENT_OFF,
          duration: 'once',
          name: 'Bienvenue -20%',
        });
        couponId = coupon.id;
      }

      const promotionCode = await stripe.promotionCodes.create({
        coupon: couponId,
        code: CODE,
      });

      return NextResponse.json({
        ok: true,
        message: 'Code BIENVENUE10 créé et activé (20 % de remise).',
        promotion_code_id: promotionCode.id,
        code: promotionCode.code,
      });
    }

    if (action === 'create' && code) {
      const amountCents = amount_off != null ? Math.round(Number(amount_off) * 100) : null;
      const percent = percent_off != null ? Number(percent_off) : null;
      if (!amountCents && !percent) {
        return NextResponse.json(
          { error: 'Indiquez amount_off (en €) ou percent_off' },
          { status: 400 }
        );
      }

      const couponParams: Stripe.CouponCreateParams = {
        duration: 'once',
        name: `Promo ${code}`,
      };
      if (amountCents) {
        couponParams.amount_off = amountCents;
        couponParams.currency = 'eur';
      } else {
        couponParams.percent_off = Math.min(100, Math.max(0, percent!));
      }

      const coupon = await stripe.coupons.create(couponParams);
      const promotionCode = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code: String(code).toUpperCase().replace(/\s/g, ''),
      });

      return NextResponse.json({
        ok: true,
        message: `Code ${promotionCode.code} créé.`,
        promotion_code_id: promotionCode.id,
        code: promotionCode.code,
      });
    }

    return NextResponse.json(
      { error: 'Action non reconnue ou paramètres manquants' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Erreur création code promo:', error);
    return NextResponse.json(
      {
        error: 'Erreur Stripe',
        details: error instanceof Error ? error.message : 'Inconnu',
      },
      { status: 500 }
    );
  }
}

/** PATCH: activer/désactiver un code promo */
export async function PATCH(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      return NextResponse.json(
        { error: 'Stripe non configuré' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { promotion_code_id, active } = body;

    if (!promotion_code_id || typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'promotion_code_id et active (boolean) requis' },
        { status: 400 }
      );
    }

    const updated = await stripe.promotionCodes.update(promotion_code_id, {
      active,
    });

    return NextResponse.json({
      ok: true,
      promotion_code_id: updated.id,
      code: updated.code,
      active: updated.active,
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour code promo:', error);
    return NextResponse.json(
      {
        error: 'Erreur Stripe',
        details: error instanceof Error ? error.message : 'Inconnu',
      },
      { status: 500 }
    );
  }
}
