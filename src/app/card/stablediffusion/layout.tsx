import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('stablediffusion');

export default function StablediffusionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="stablediffusion" />
      {children}
    </>
  );
}
