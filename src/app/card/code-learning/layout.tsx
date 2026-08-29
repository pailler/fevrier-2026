import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('code-learning');

export default function CodeLearningLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="code-learning" />
      {children}
    </>
  );
}
