import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/avantages',
  title: 'Avantages IAHome — pourquoi choisir la plateforme',
  description:
    'Une seule plateforme en français, des crédits clairs, des outils IA et services utiles (transcription, images, PDF, domotique). Découvrez les avantages IAHome.',
  keywords: [
    'avantages IAHome',
    'pourquoi IAHome',
    'plateforme IA tout-en-un',
    'outils IA France',
    'crédits IA',
    'RGPD',
  ],
});

export default function AvantagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
