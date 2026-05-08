/**
 * Méthodes et repères pour améliorer la visibilité de iahome.fr dans les moteurs de recherche.
 *
 * **Déjà couverts par le code (technique on-page)** :
 * - Métadonnées Next (`metadata`, `buildPageSeo`), canonical, Open Graph, Twitter
 * - `robots.ts` + `sitemap.xml` dynamique
 * - JSON-LD Organization + WebSite + SearchAction (`structuredData.ts`, injecté dans le layout)
 * - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` pour Search Console
 *
 * **À faire côté produit / marketing (hors repo ou outils externes)** :
 * - Google Search Console : soumettre le sitemap, surveiller l’indexation et les requêtes
 * - Contenu unique et mis à jour (blog, pages modules) avec mots-clés naturels
 * - Liens entrants de qualité (partenaires, presse, annuaires pertinents)
 * - Core Web Vitals (LCP, CLS) : images optimisées, polices, éviter le JS inutile au-dessus de la ligne de flottaison
 *
 * Utilitaires ci-dessous : breadcrumbs et FAQ pour pages ciblées.
 */

import { SITE_URL } from '@/utils/pageMetadata';

export type BreadcrumbItem = { name: string; path: string };

/**
 * JSON-LD BreadcrumbList pour une page profonde (rich results fil d’Ariane).
 * @see https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */
export function getBreadcrumbListJsonLd(items: BreadcrumbItem[]) {
  const list = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.path.startsWith('http') ? item.path : `${SITE_URL}${item.path.startsWith('/') ? '' : '/'}${item.path}`,
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: list,
  };
}

export type FaqPair = { question: string; answer: string };

/**
 * JSON-LD FAQPage (utiliser sur une page avec vraies Q/R, éviter le contenu trompeur).
 */
export function getFaqPageJsonLd(faqs: FaqPair[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}
