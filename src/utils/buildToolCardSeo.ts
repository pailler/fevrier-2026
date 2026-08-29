import type { Metadata } from 'next';
import { getToolSeoManifest, type ToolSeoManifestEntry } from '@/data/toolSeoManifest';
import { buildPageSeo, SITE_URL } from '@/utils/pageMetadata';

/** Métadonnées Next.js homogènes pour une fiche /card/{slug}. */
export function buildToolCardMetadata(slug: string): Metadata {
  const entry = getToolSeoManifest(slug);
  if (!entry) {
    throw new Error(`SEO manifest introuvable pour le slug « ${slug} »`);
  }
  const ogImage = entry.ogImage?.startsWith('http')
    ? entry.ogImage
    : `${SITE_URL}${entry.ogImage ?? '/og-image.jpg'}`;
  return buildPageSeo({
    path: `/card/${slug}`,
    title: entry.title,
    description: entry.description,
    keywords: entry.keywords,
    ogImage,
  });
}

/** Entrée JSON-LD (SoftwareApplication + FAQ) pour card-seo. */
export function getToolSeoJsonLdEntry(slug: string): ToolSeoManifestEntry | null {
  return getToolSeoManifest(slug);
}
