import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('metube');

export default function MetubeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="metube" />
      {children}
    </>
  );
}
