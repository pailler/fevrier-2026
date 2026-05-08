import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/photobooth',
  title: 'Photobooth événementiel — borne photo et animations',
  description:
    'Photobooth connecté pour vos événements (mariage, anniversaires, entreprises…) : captures, galerie et partage. Service Photobooth IAHome.',
  keywords: [
    'photobooth événement',
    'borne photo événement',
    'photobooth connecté',
    'animation photo soirée',
    'IAHome photobooth',
  ],
});

export default function PhotoboothLayout({ children }: { children: React.ReactNode }) {
  return children;
}
