import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('resas-system');

export default function ResasSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="resas-system" />
      {children}
    </>
  );
}
