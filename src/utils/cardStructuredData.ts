import { SITE_URL } from '@/utils/pageMetadata';
import { getBreadcrumbListJsonLd, getFaqPageJsonLd, type BreadcrumbItem, type FaqPair } from '@/utils/searchRanking';

export type CardProductInput = {
  slug: string;
  name: string;
  description: string;
  applicationCategory?: string;
  features?: string[];
  /** Coût en crédits/tokens (affiché dans l'offre schema.org) */
  priceTokens?: number;
};

/**
 * JSON-LD SoftwareApplication pour les fiches produit /card/{slug}.
 * Pas de aggregateRating fictif — risque de pénalité Google.
 */
export function getSoftwareApplicationJsonLd(input: CardProductInput) {
  const url = `${SITE_URL}/card/${input.slug}`;
  return {
    '@type': 'SoftwareApplication',
    '@id': `${url}#software`,
    name: input.name,
    applicationCategory: input.applicationCategory ?? 'WebApplication',
    operatingSystem: 'Web',
    url,
    description: input.description,
    inLanguage: 'fr-FR',
    ...(input.features?.length ? { featureList: input.features } : {}),
    ...(input.priceTokens !== undefined
      ? {
          offers: {
            '@type': 'Offer',
            price: String(input.priceTokens),
            priceCurrency: 'TOKENS',
            availability: 'https://schema.org/InStock',
            url,
          },
        }
      : {}),
    provider: { '@id': `${SITE_URL}/#organization` },
  };
}

export function getWebPageJsonLd(input: CardProductInput) {
  const url = `${SITE_URL}/card/${input.slug}`;
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${url}#software` },
    primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}/og-image.jpg` },
  };
}

export function getCardBreadcrumbJsonLd(slug: string, productName: string) {
  const items: BreadcrumbItem[] = [
    { name: 'Accueil', path: '/' },
    { name: 'Applications', path: '/applications' },
    { name: productName, path: `/card/${slug}` },
  ];
  return getBreadcrumbListJsonLd(items);
}

/** Graphe JSON-LD complet pour une fiche produit (WebPage + SoftwareApplication + BreadcrumbList + FAQ). */
export function getCardPageJsonLdGraph(product: CardProductInput, faqs?: FaqPair[]) {
  const graph: Record<string, unknown>[] = [
    getWebPageJsonLd(product),
    getSoftwareApplicationJsonLd(product),
    getCardBreadcrumbJsonLd(product.slug, product.name),
  ];
  if (faqs?.length) {
    graph.push(getFaqPageJsonLd(faqs));
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
