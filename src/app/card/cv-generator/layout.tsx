import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('cv-generator');

export default function CvGeneratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="cv-generator" />
      {children}
    </>
  );
}
