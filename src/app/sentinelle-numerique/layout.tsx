import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/sentinelle-numerique',
  title: 'Sentinelle Numérique — cybersécurité personnelle et fin de vie numérique',
  description:
    'Audit sécurité, plan de transmission numérique et actions post-événement. Sécurisez et organisez votre patrimoine numérique avec Sentinelle Numérique sur IAHome.',
  keywords: [
    'Sentinelle Numérique',
    'cybersécurité personnelle',
    'fin de vie numérique',
    'transmission données numériques',
    'audit sécurité numérique',
    'patrimoine numérique',
    'IAHome',
  ],
});

export default function SentinelleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
