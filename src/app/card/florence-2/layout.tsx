import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('florence-2');

export default function Florence2Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="florence-2" />
      {children}
    </>
  );
}
