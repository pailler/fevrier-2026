import type { Metadata } from 'next';
import { CardPageJsonLd } from '@/components/CardPageJsonLd'
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/card/resas-system',
  title: 'Reservation materiel - calendrier et emprunts',
  description:
    'Reservez materiels et equipements : calendrier, notifications et suivi des emprunts. Module IAHome.',
  keywords: ['reservation', 'materiel', 'calendrier', 'IAHome', 'evenement'],
});

export default function CardResasSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="resas-system" />
      {children}
    </>
  );
}