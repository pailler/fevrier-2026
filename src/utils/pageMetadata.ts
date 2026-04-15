import type { Metadata } from 'next';

export const SITE_URL = 'https://iahome.fr';
export const SITE_NAME = 'IA Home';

export type PageSeoInput = {
  /** Chemin canonique, ex. `/applications` */
  path: string;
  /** Titre court ; « | IAHome » est ajouté si absent */
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  noindex?: boolean;
};

/**
 * Métadonnées SEO homogènes : title, description, keywords, canonical, Open Graph, Twitter, robots.
 */
export function buildPageSeo({
  path,
  title,
  description,
  keywords,
  ogImage,
  noindex,
}: PageSeoInput): Metadata {
  const p = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${SITE_URL}${p}`;
  const fullTitle = title.includes('|') ? title.trim() : `${title.trim()} | IAHome`;
  const image = ogImage ?? `${SITE_URL}/og-image.jpg`;

  return {
    title: fullTitle,
    description,
    keywords: [...keywords],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'fr_FR',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@iahome_fr',
      creator: '@iahome_fr',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}
