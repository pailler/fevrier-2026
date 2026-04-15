import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/search',
  title: 'Recherche — trouver une application ou une page',
  description:
    'Recherchez sur IAHome : applications IA, fiches services, contenus et liens utiles de la plateforme.',
  keywords: [
    'recherche IAHome',
    'trouver application IA',
    'chercher sur site',
    'moteur recherche plateforme',
  ],
  noindex: true,
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
