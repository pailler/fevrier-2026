import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('cogstudio');

export default function CogstudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="cogstudio" />
      {children}
    </>
  );
}
