import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('reveil-intelligent');

export default function ReveilIntelligentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="reveil-intelligent" />
      {children}
    </>
  );
}
