import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('ai-detector');

export default function AiDetectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="ai-detector" />
      {children}
    </>
  );
}
