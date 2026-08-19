import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/applications',
  title: 'Ecosystème d\'applications IA et services en ligne — tout-en-un',
  description:
    'Whisper, Stable Diffusion, PDF+IA, Home Assistant, QR codes, transcription, images et plus encore. Un écosystème français : un compte, des crédits, accès aux services, interface en français.',
  keywords: [
    'applications IA',
    'plateforme IA France',
    'outils IA en ligne',
    'Whisper transcription',
    'Stable Diffusion en ligne',
    'PDF IA',
    'Home Assistant cloud',
    'services IAHome',
    'activer application IA',
    'IA française',
    'RGPD',
  ],
});

export default function ApplicationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
