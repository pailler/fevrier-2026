import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/essentiels',
  title: 'Ecosystème d\'outils essentiels — services IAHome',
  description:
    'Accès centralisé à l\'écosystème d\'outils essentiels IAHome : lancer vos applications, scripts et services associés à la plateforme.',
  keywords: [
    'écosystème outils essentiels IAHome',
    'démarrer services IAHome',
    'hub applications',
    'lancer outils IA',
  ],
});

export default function EssentielsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
