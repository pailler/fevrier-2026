import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/card/reveil-intelligent',
  title: 'Réveil Intelligent — météo et jours fériés',
  description:
    'Réveil mobile avec messages adaptés à la météo, au jour de la semaine et aux jours fériés. Module IAHome.',
  keywords: ['réveil', 'météo', 'alarme', 'IAHome', 'mobile'],
});

export default function CardReveilLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="reveil-intelligent" />
      {children}
    </>
  );
}
