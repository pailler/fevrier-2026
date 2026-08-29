import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('photomaker');

export default function PhotomakerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="photomaker" />
      {children}
    </>
  );
}
