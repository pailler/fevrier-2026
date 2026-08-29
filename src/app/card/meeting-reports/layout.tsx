import { CardPageJsonLd } from '@/components/CardPageJsonLd';
import { buildToolCardMetadata } from '@/utils/buildToolCardSeo';

export const metadata = buildToolCardMetadata('meeting-reports');

export default function MeetingReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CardPageJsonLd slug="meeting-reports" />
      {children}
    </>
  );
}
