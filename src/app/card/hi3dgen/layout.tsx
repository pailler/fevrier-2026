import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('hi3dgen');

export default function Hi3dgenLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="hi3dgen" />
      {children}
    </>
  );
}
