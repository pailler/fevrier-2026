import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('administration');

export default function AdministrationLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="administration" />
      {children}
    </>
  );
}
