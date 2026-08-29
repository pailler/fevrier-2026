import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('apprendre-autrement');

export default function ApprendreAutrementLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="apprendre-autrement" />
      {children}
    </>
  );
}
