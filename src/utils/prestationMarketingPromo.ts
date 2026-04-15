/**
 * Ristourne 199 € TTC : photobooth personnalisé (catalogue 399 €) ou prestation marketing (catalogue 249 €).
 * Valable jusqu'au 5 avril 2026 inclus (fin de journée, Europe/Paris).
 */
export const PRESTATION_MARKETING_PROMO_END_MS = new Date(
  '2026-04-05T23:59:59+02:00'
).getTime();

export function isPrestationMarketingPromoActive(now = Date.now()): boolean {
  return now <= PRESTATION_MARKETING_PROMO_END_MS;
}

/** Même fenêtre de dates que la prestation marketing (photobooth : catalogue 399 € → 199 €). */
export function isPhotoboothPersonalizedPromoActive(now = Date.now()): boolean {
  return isPrestationMarketingPromoActive(now);
}
