import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('hunyuan3d');

export default function Hunyuan3dLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="hunyuan3d" />
      {children}
    </>
  );
}
