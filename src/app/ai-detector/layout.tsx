import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/ai-detector',
  title: 'Détecteur de texte IA — identifier un contenu généré',
  description:
    'Estimation rapide : votre texte ressemble-t-il à du contenu généré par une IA ? Outil en français sur IAHome pour vérification ou pédagogie.',
  keywords: [
    'détecteur IA',
    'détecter ChatGPT',
    'texte généré IA',
    'vérifier contenu IA',
    'IA détection plagiat',
    'IAHome détecteur',
  ],
});

export default function AiDetectorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
