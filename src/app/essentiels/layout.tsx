import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/essentiels',
  title: 'Essentiels — hub de démarrage des services IAHome',
  description:
    'Accès centralisé aux essentiels IAHome : lancer vos applications, scripts et services associés à la plateforme.',
  keywords: [
    'essentiels IAHome',
    'démarrer services IAHome',
    'hub applications',
    'lancer outils IA',
  ],
});

export default function EssentielsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
