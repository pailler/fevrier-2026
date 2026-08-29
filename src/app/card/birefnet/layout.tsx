import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('birefnet');

export default function BirefnetLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="birefnet" />
      {children}
    </>
  );
}
