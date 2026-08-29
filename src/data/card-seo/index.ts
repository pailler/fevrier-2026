import { CARD_TOOL_SLUGS, getToolSeoManifest } from '@/data/toolSeoManifest';
import type { CardProductInput } from '@/utils/cardStructuredData';
import { cardSeoData as generated } from './generated';
import { cardSeoFallbacks, type CardSeoEntry } from './fallbacks';
import { whisperCardSeo } from './whisper';

export type { CardSeoEntry };

function overlayManifest(slug: string, existing: CardSeoEntry | null): CardSeoEntry | null {
  const manifest = getToolSeoManifest(slug);
  if (!manifest) return existing;

  const baseProduct: CardProductInput = existing?.product ?? manifest.product;
  return {
    product: {
      ...baseProduct,
      ...manifest.product,
      features: manifest.product.features ?? baseProduct.features,
      priceTokens: manifest.product.priceTokens ?? baseProduct.priceTokens,
    },
    faqs: existing?.faqs?.length ? existing.faqs : manifest.faqs,
  };
}

function mergeCardSeo(): Record<string, CardSeoEntry | null> {
  const merged: Record<string, CardSeoEntry | null> = { ...generated };
  for (const [slug, entry] of Object.entries(cardSeoFallbacks)) {
    if (!merged[slug]) merged[slug] = entry;
  }
  merged.whisper = whisperCardSeo;

  for (const slug of CARD_TOOL_SLUGS) {
    merged[slug] = overlayManifest(slug, merged[slug] ?? null);
  }

  const reveil = merged['reveil-intelligent'];
  if (reveil) {
    merged.reveil = {
      ...reveil,
      product: { ...reveil.product, slug: 'reveil' },
    };
  }

  delete merged['[id]'];
  return merged;
}

/** Données SEO JSON-LD par slug de fiche produit. */
export const cardSeoData = mergeCardSeo();

export function getCardSeo(slug: string): CardSeoEntry | null {
  if (slug === 'reveil') return cardSeoData.reveil ?? cardSeoData['reveil-intelligent'] ?? null;
  return cardSeoData[slug] ?? null;
}
