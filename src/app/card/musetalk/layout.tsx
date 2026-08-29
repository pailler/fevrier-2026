import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('musetalk');

export default function MusetalkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="musetalk" />
      {children}
    </>
  );
}
