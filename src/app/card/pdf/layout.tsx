import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('pdf');

export default function PdfLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="pdf" />
      {children}
    </>
  );
}
