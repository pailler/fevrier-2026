import { seoConfig } from '@/utils/seoConfig';

const SITE = seoConfig.site.url.replace(/\/$/, '');

/** Liens sociaux réels uniquement (https), pour sameAs schema.org */
function sameAsUrls(): string[] {
  const s = seoConfig.social;
  const candidates = [s.twitter, s.linkedin, s.github, s.youtube, s.discord].filter(
    (u): u is string => typeof u === 'string' && u.startsWith('https://')
  );
  return [...new Set(candidates)];
}

/**
 * JSON-LD Organization — identité du site pour Google (Knowledge Graph, panneau latéral).
 * @see https://developers.google.com/search/docs/appearance/structured-data/organization
 */
export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.site.name,
    url: SITE,
    description: seoConfig.site.description,
    logo: seoConfig.site.logo.startsWith('http') ? seoConfig.site.logo : `${SITE}${seoConfig.site.logo}`,
    sameAs: sameAsUrls(),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: seoConfig.contact.email,
      areaServed: 'FR',
      availableLanguage: ['French', 'fr'],
    },
  };
}

/**
 * JSON-LD WebSite + SearchAction — lien vers la recherche interne (sitelinks search box).
 * @see https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
 */
export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.site.name,
    url: `${SITE}/`,
    inLanguage: seoConfig.site.language,
    description: seoConfig.site.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Graphe unique : Organization (@id) + WebSite référence l’éditeur */
export function getDefaultJsonLdGraph() {
  const orgId = `${SITE}/#organization`;
  const org = { ...getOrganizationJsonLd(), '@id': orgId };
  const web = { ...getWebSiteJsonLd(), publisher: { '@id': orgId } };
  return {
    '@context': 'https://schema.org',
    '@graph': [org, web],
  };
}
