import { CardPageJsonLd } from '@/components/CardPageJsonLd'
import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/card/photo-vivante',
  title: 'Photo Vivante — animation photo realiste',
  description:
    'Photo Vivante sur IAHome : animez une photo fixe avec un rendu naturel, acces par credits et ouverture securisee par token.',
  keywords: [
    'Photo Vivante IAHome',
    'animation photo IA',
    'photo animee realiste',
    'portrait anime IA',
    'module photo vivante',
  ],
});

export default function CardPhotoVivanteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="photo-vivante" />
      {children}
    </>
  );
}
