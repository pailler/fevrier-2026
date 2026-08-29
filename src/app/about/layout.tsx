import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';
import { getValueProposition } from '@/data/ecosystemValueProposition';

const aboutVp = getValueProposition('about');

export const metadata: Metadata = buildPageSeo({
  path: '/about',
  title: 'À propos — mission et vision IAHome',
  description: `${aboutVp.subheadline} ${aboutVp.oneLiner}`,
  keywords: [
    'à propos IAHome',
    'mission IAHome',
    'écosystème IA France',
    'démocratiser intelligence artificielle',
    'équipe IAHome',
    'valeurs IAHome',
  ],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
