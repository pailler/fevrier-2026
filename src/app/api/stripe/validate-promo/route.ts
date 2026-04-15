import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

/** Code promo standard site (-20 %), celui utilisé sur la page tarifs et les liens marketing. */
const STANDARD_PROMO_CODE = 'BIENVENUE10';

/** Anciens liens / QR : même réduction que BIENVENUE10. */
const LEGACY_PROMO_ALIASES: Record<string, string> = {
  BIENVENUE2026: STANDARD_PROMO_CODE,
};

function pickActiveMatch(candidates: Stripe.PromotionCode[], upperCode: string): Stripe.PromotionCode | null {
  return (
    candidates.find(
      (p) => (p.code || '').toUpperCase() === upperCode && p.active === true && p.coupon != null
    ) ?? null
  );
}

/** Agrège les résultats de list({ code }) pour plusieurs variantes (casse / saisie). */
async function listByCodeVariants(variants: string[]): Promise<Stripe.PromotionCode[]> {
  const byId = new Map<string, Stripe.PromotionCode>();
  for (const v of variants) {
    if (!v) continue;
    try {
      const { data } = await stripe.promotionCodes.list({ code: v, limit: 30 });
      for (const p of data) {
        if (!byId.has(p.id)) byId.set(p.id, p);
      }
    } catch {
      /* ignore une variante si l’API rejette */
    }
  }
  return [...byId.values()];
}

/** Repli : parcourir les codes promo si le filtre `code` ne renvoie rien (comptes / versions API). */
async function findPromotionCodePaginated(upperCode: string, maxPages = 40): Promise<Stripe.PromotionCode | null> {
  let startingAfter: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const params: Stripe.PromotionCodeListParams = { limit: 100 };
    if (startingAfter) params.starting_after = startingAfter;
    const { data: page, has_more } = await stripe.promotionCodes.list(params);
    const hit = page.find((p) => (p.code || '').toUpperCase() === upperCode && p.active && p.coupon);
    if (hit) return hit;
    if (!has_more || page.length === 0) break;
    startingAfter = page[page.length - 1].id;
  }
  return null;
}

/**
 * Crée ou réactive BIENVENUE10 (-20 %) si absent / inactif (idempotent).
 * Permet à la page tarifs de fonctionner sans passage admin préalable.
 */
async function ensureBienvenue10PromotionCode(): Promise<Stripe.PromotionCode | null> {
  const CODE = STANDARD_PROMO_CODE;
  const PERCENT_OFF = 20;

  const { data: matching } = await stripe.promotionCodes.list({ code: CODE, limit: 30 });

  const activeHit = matching.find(
    (p) => p.active && p.coupon && (p.code || '').toUpperCase() === CODE
  );
  if (activeHit) return activeHit;

  const inactive = matching.find(
    (p) => !p.active && p.coupon && (p.code || '').toUpperCase() === CODE
  );
  if (inactive) {
    return await stripe.promotionCodes.update(inactive.id, { active: true });
  }

  let couponId: string | null = null;
  const couponsList = await stripe.coupons.list({ limit: 100 });
  const couponMatch = couponsList.data.find(
    (c) => (c as Stripe.Coupon).percent_off === PERCENT_OFF && c.duration === 'once' && !c.redeem_by
  );
  if (couponMatch) {
    couponId = couponMatch.id;
  } else {
    const created = await stripe.coupons.create({
      percent_off: PERCENT_OFF,
      duration: 'once',
      name: `Promo ${CODE} -${PERCENT_OFF}%`,
    });
    couponId = created.id;
  }

  const promotionCode = await stripe.promotionCodes.create({
    coupon: couponId,
    code: CODE,
  });
  return promotionCode;
}

async function resolvePromotionCode(rawTrimmed: string, upperCode: string): Promise<Stripe.PromotionCode | null> {
  const variants = Array.from(
    new Set([upperCode, rawTrimmed, rawTrimmed.toUpperCase(), rawTrimmed.toLowerCase()].filter(Boolean))
  );

  const merged = await listByCodeVariants(variants);
  let match = pickActiveMatch(merged, upperCode);
  if (match) return match;

  match = await findPromotionCodePaginated(upperCode);
  if (match) return match;

  const autoEnsureOff =
    process.env.STRIPE_DISABLE_AUTO_ENSURE_BIENVENUE10 === 'true' ||
    process.env.STRIPE_DISABLE_AUTO_ENSURE_BIENVENUE2026 === 'true';
  if (upperCode === STANDARD_PROMO_CODE && !autoEnsureOff) {
    try {
      const ensured = await ensureBienvenue10PromotionCode();
      if (ensured?.active && ensured.coupon) return ensured;
    } catch (e) {
      console.error('validate-promo: ensure BIENVENUE10 failed', e);
    }
  }

  const envId =
    process.env.STRIPE_PROMOTION_CODE_ID_BIENVENUE10?.trim() ||
    process.env.STRIPE_PROMOTION_CODE_ID_BIENVENUE2026?.trim();
  if (upperCode === STANDARD_PROMO_CODE && envId?.startsWith('promo_')) {
    try {
      const pc = await stripe.promotionCodes.retrieve(envId);
      if (pc.active && pc.coupon) return pc;
    } catch {
      /* ignore */
    }
  }

  return null;
}

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

    const raw = request.nextUrl.searchParams.get('code')?.trim();
    if (!raw) {
      return NextResponse.json({ valid: false, error: 'Code manquant' }, { status: 400 });
    }

    const compact = raw.replace(/\s/g, '');
    const upper = compact.toUpperCase();
    const effectiveUpper = LEGACY_PROMO_ALIASES[upper] ?? upper;
    const effectiveCompact = LEGACY_PROMO_ALIASES[upper] ?? compact;

    const match = await resolvePromotionCode(effectiveCompact, effectiveUpper);

    if (!match?.coupon) {
      return NextResponse.json(
        { valid: false, error: 'Code invalide ou expiré' },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' },
        }
      );
    }

    const coupon =
      typeof match.coupon === 'object' ? match.coupon : await stripe.coupons.retrieve(match.coupon as string);
    const normalizedCode = ((match.code || upper) as string).toUpperCase();
    let percentOff = coupon && 'percent_off' in coupon ? coupon.percent_off : null;
    if (normalizedCode === STANDARD_PROMO_CODE) {
      percentOff = 20;
    }
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
