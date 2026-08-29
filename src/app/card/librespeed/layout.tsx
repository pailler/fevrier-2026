import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('librespeed');

export default function LibrespeedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="librespeed" />
      {children}
    </>
  );
}
