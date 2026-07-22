import type { CardProductInput } from '@/utils/cardStructuredData';
import type { FaqPair } from '@/utils/searchRanking';
import { cardSeoData as generated } from './generated';
import { cardSeoFallbacks, type CardSeoEntry } from './fallbacks';
import { whisperCardSeo } from './whisper';

export type { CardSeoEntry };

function mergeCardSeo(): Record<string, CardSeoEntry | null> {
  const merged: Record<string, CardSeoEntry | null> = { ...generated };
  for (const [slug, entry] of Object.entries(cardSeoFallbacks)) {
    if (!merged[slug]) merged[slug] = entry;
  }
  merged.whisper = whisperCardSeo;
  delete merged['[id]'];
  return merged;
}

/** Données SEO JSON-LD par slug de fiche produit. */
export const cardSeoData = mergeCardSeo();

export function getCardSeo(slug: string): CardSeoEntry | null {
  return cardSeoData[slug] ?? null;
}
