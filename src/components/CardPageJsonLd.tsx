import { JsonLd } from '@/components/JsonLd';
import { getCardSeo } from '@/data/card-seo';
import { getCardPageJsonLdGraph } from '@/utils/cardStructuredData';

type Props = { slug: string };

/**
 * JSON-LD serveur pour les fiches /card/{slug}.
 * Données centralisées dans src/data/card-seo/ + toolSeoManifest.
 */
export function CardPageJsonLd({ slug }: Props) {
  const entry = getCardSeo(slug);
  if (!entry) return null;
  return <JsonLd data={getCardPageJsonLdGraph(entry.product, entry.faqs)} />;
}
