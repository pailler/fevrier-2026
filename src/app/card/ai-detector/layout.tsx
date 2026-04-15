import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/card/ai-detector',
  title: 'Détecteur de contenu IA — analyse de texte',
  description:
    'Module Détecteur IA sur IAHome : collez un texte pour une estimation de probabilité de génération par intelligence artificielle.',
  keywords: [
    'détecteur contenu IA',
    'analyse texte IA',
    'module détecteur IAHome',
    'texte généré intelligence artificielle',
  ],
});

export default function CardAiDetectorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
