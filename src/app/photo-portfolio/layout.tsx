import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/photo-portfolio',
  title: 'Portfolio photo — espace personnel',
  description: 'Gérez votre portfolio de photos sur votre compte IAHome.',
  keywords: ['portfolio photo IAHome'],
  noindex: true,
});

export default function PhotoPortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
