import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('comfyui');

export default function ComfyuiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="comfyui" />
      {children}
    </>
  );
}
