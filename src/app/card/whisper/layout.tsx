import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('whisper');

export default function WhisperLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="whisper" />
      {children}
    </>
  );
}
