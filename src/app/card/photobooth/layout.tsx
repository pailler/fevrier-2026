import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('photobooth');

export default function PhotoboothLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="photobooth" />
      {children}
    </>
  );
}
