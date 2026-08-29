import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('prompt-generator');

export default function PromptGeneratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="prompt-generator" />
      {children}
    </>
  );
}
