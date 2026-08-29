import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('vote');

export default function VoteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="vote" />
      {children}
    </>
  );
}
