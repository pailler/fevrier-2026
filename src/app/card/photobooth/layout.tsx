import { CardPageJsonLd } from '@/components/CardPageJsonLd'
import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/card/photobooth',
  title: 'Photobooth/Videobooth connecté — activer la borne photo événement',
  description:
    'Photobooth/Videobooth connecté sur IAHome : galerie, animations et partage pour vos événements professionnels ou privés. Accès avec vos crédits.',
  keywords: [
    'Photobooth/Videobooth connecté IAHome',
    'activer Photobooth/Videobooth connecté',
    'borne photo événement',
    'module Photobooth/Videobooth connecté',
  ],
});

export default function CardPhotoboothLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="photobooth" />
      {children}
    </>
  );
}
