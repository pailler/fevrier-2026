import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('qrcodes');

export default function QrcodesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="qrcodes" />
      {children}
    </>
  );
}
