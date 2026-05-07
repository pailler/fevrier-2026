import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/card/vote',
  title: 'Vote en ligne — PIN et QR code',
  description:
    'Créez un vote avec code PIN, participants et QR code pour voter en ligne. Module IAHome.',
  keywords: ['vote en ligne', 'QR code', 'IAHome', 'événement'],
});

export default function CardVoteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
