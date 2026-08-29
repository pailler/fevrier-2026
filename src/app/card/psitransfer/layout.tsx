import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('psitransfer');

export default function PsitransferLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="psitransfer" />
      {children}
    </>
  );
}
