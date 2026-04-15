import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

/** Ancienne URL /pricing : redirection vers /pricing2 ; SEO évite le contenu dupliqué. */
export const metadata: Metadata = buildPageSeo({
  path: '/pricing2',
  title: 'Tarifs IAHome',
  description: 'Les tarifs et crédits IAHome sont sur la page tarifs à jour.',
  keywords: ['tarifs IAHome', 'prix IAHome'],
  noindex: true,
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
