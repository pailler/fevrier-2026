import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('animagine-xl');

export default function AnimagineXlLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="animagine-xl" />
      {children}
    </>
  );
}
