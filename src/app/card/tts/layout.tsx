import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('tts');

export default function TtsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="tts" />
      {children}
    </>
  );
}
