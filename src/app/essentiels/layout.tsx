import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';
import { getValueProposition } from '@/data/ecosystemValueProposition';

const essVp = getValueProposition('essentiels');

export const metadata: Metadata = buildPageSeo({
  path: '/essentiels',
  title: 'Outils essentiels — plateforme française, RGPD, support FR',
  description: `${essVp.subheadline} ${essVp.oneLiner}`,
  keywords: [
    'outils numériques français',
    'RGPD',
    'support français',
    'partager fichier en ligne',
    'QR code événement',
    'PDF en ligne',
  ],
});

export default function EssentielsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
