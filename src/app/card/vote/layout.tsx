import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/card/vote',
  title: 'Vote en ligne — création et QR code',
  description:
    'Créez un vote avec code PIN, participants et QR code pour voter en ligne. Module IAHome connecté à Supabase.',
  keywords: ['vote en ligne', 'QR code vote', 'IAHome vote', 'code PIN vote'],
});

export default function CardVoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
