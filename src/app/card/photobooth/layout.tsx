import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/card/photobooth',
  title: 'Photobooth — activer la borne photo événement',
  description:
    'Photobooth sur IAHome : galerie, animations et partage pour vos événements professionnels ou privés. Accès avec vos crédits.',
  keywords: [
    'photobooth IAHome',
    'activer photobooth',
    'borne photo événement',
    'module photobooth',
  ],
});

export default function CardPhotoboothLayout({ children }: { children: React.ReactNode }) {
  return children;
}
