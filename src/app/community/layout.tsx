import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/community',
  title: 'Communauté — entraide et échanges autour de l’IA',
  description:
    'Rejoignez la communauté IAHome : échanges sur l’intelligence artificielle, les outils du quotidien et les usages concrets sur la plateforme.',
  keywords: [
    'communauté IA',
    'forum intelligence artificielle',
    'entraide IA',
    'échanges IAHome',
    'utilisateurs IA France',
  ],
});

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
