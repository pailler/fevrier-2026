import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('ruinedfooocus');

export default function RuinedfooocusLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="ruinedfooocus" />
      {children}
    </>
  );
}
