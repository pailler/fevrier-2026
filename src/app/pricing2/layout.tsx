import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/pricing2',
  title: 'Tarifs et crédits — prix transparents',
  description:
    'Crédits IAHome, packs et accès aux applications : payez ce que vous utilisez. Tarifs clairs pour Whisper, images IA, PDF, domotique et services associés.',
  keywords: [
    'tarifs IAHome',
    'prix plateforme IA',
    'crédits IA',
    'abonnement applications IA',
    'combien coûte IAHome',
    'prix transcription IA',
  ],
});

export default function Pricing2Layout({ children }: { children: React.ReactNode }) {
  return children;
}
