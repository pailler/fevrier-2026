import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('home-assistant');

export default function HomeAssistantLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="home-assistant" />
      {children}
    </>
  );
}
