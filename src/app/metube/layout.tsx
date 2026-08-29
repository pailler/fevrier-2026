import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/metube',
  title: 'MeTube — téléchargement YouTube privé',
  description:
    'Téléchargez vos vidéos et playlists YouTube en MP4, MP3 ou WebM sur vos serveurs IAHome. Accès sécurisé par jeton.',
  keywords: ['MeTube', 'télécharger YouTube', 'youtube mp3', 'IAHome'],
});

export default function MeTubeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
