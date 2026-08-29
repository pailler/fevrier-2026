import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('sentinelle-numerique');

export default function SentinelleNumeriqueLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="sentinelle-numerique" />
      {children}
    </>
  );
}
