import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/photo-vivante',
  title: 'Photo Vivante — animation photo realiste',
  description:
    'Service IAHome pour animer des photos avec un rendu naturel : fiche detaillee, acces par credits et ouverture securisee.',
  keywords: [
    'photo vivante',
    'animation photo realiste',
    'photo animee IAHome',
    'module IA photo',
  ],
});

export default function PhotoVivanteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
