import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/marketing',
  title: 'Solutions IA pour entreprises et équipes',
  description:
    'Productivité, création de contenu, automatisation : découvrez comment les équipes utilisent la plateforme IAHome (transcription, images, PDF, outils métiers).',
  keywords: [
    'solutions IA entreprise',
    'productivité IA',
    'outils IA professionnels',
    'plateforme IA équipe',
    'IA pour PME',
    'IAHome pro',
  ],
});

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
