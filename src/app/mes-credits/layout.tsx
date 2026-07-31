import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/mes-credits',
  title: 'Mes crédits — solde IAHome',
  description: 'Consultez vos crédits et votre historique d\'utilisation sur IAHome.',
  keywords: ['crédits IAHome', 'solde', 'historique'],
  noindex: true,
});

export default function MesCreditsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
