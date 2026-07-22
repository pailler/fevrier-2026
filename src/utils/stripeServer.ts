import Stripe from 'stripe';

export const STRIPE_API_VERSION = '2025-08-27.basil' as const;

let stripeSingleton: Stripe | null = null;

/** Stripe côté serveur — initialisation paresseuse pour que `next build` fonctionne sans STRIPE_SECRET_KEY. */
export function getStripeServer(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY manquant ou vide');
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, { apiVersion: STRIPE_API_VERSION });
  }
  return stripeSingleton;
}
