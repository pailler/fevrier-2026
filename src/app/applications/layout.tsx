import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';
import { getValueProposition } from '@/data/ecosystemValueProposition';

const appsVp = getValueProposition('applications');

export const metadata: Metadata = buildPageSeo({
  path: '/applications',
  title: 'Applications IA — GPU CUDA dédié, zéro installation',
  description: `${appsVp.subheadline} ${appsVp.oneLiner}`,
  keywords: [
    'applications IA GPU',
    'plateforme IA française',
    'RGPD IA',
    'support français',
    'CUDA en ligne France',
    'génération image IA',
    'GPU distant navigateur',
  ],
});

export default function ApplicationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
