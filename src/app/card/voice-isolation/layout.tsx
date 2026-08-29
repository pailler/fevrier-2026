import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('voice-isolation');

export default function VoiceIsolationLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="voice-isolation" />
      {children}
    </>
  );
}
