import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('reveil');

export default function ReveilLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="reveil" />
      {children}
    </>
  );
}
