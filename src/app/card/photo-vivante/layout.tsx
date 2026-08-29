import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('photo-vivante');

export default function PhotoVivanteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="photo-vivante" />
      {children}
    </>
  );
}
