import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/modules',
  title: 'Modules et applications — vos services avec crédits',
  description:
    'Vue d’ensemble des modules IAHome : transcription, génération d’images, PDF, transfert de fichiers et autres services accessibles avec vos crédits et votre compte.',
  keywords: [
    'modules IAHome',
    'applications crédits',
    'services compte IAHome',
    'applications disponibles',
    'plateforme modules',
  ],
});

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
