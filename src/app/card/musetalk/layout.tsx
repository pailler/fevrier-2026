import { CardPageJsonLd } from '@/components/CardPageJsonLd'
import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/card/musetalk',
  title: 'MuseTalk — lip-sync vidéo (audio + visage)',
  description:
    'MuseTalk sur IAHome : synchronisation labiale haute fidélité sur vidéo de référence. Accès avec crédits, déploiement local GPU.',
  keywords: [
    'MuseTalk IAHome',
    'lip sync IA',
    'doublage vidéo IA',
    'avatar parlant',
    'module musetalk',
  ],
});

export default function CardMuseTalkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="musetalk" />
      {children}
    </>
  );
}
