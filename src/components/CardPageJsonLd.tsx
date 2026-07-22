import { JsonLd } from '@/components/JsonLd';
import { cardSeoData } from '@/data/card-seo';
import { getCardPageJsonLdGraph } from '@/utils/cardStructuredData';

type Props = { slug: string };

/**
 * JSON-LD serveur pour les fiches /card/{slug}.
 * Données centralisées dans src/data/card-seo/.
 */
export function CardPageJsonLd({ slug }: Props) {
  const entry = cardSeoData[slug];
  if (!entry) return null;
  return <JsonLd data={getCardPageJsonLdGraph(entry.product, entry.faqs)} />;
}
