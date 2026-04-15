import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/my-tokens',
  title: 'Mes crédits — solde IAHome',
  description: 'Consultez vos crédits et tokens sur IAHome.',
  keywords: ['crédits IAHome', 'tokens', 'solde'],
  noindex: true,
});

export default function MyTokensLayout({ children }: { children: React.ReactNode }) {
  return children;
}
