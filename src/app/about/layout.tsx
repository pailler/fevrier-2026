import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/about',
  title: 'À propos — mission et vision IAHome',
  description:
    'IAHome démocratise l’intelligence artificielle en France : formations, outils pratiques et plateforme centralisée. Notre mission, notre équipe et nos valeurs.',
  keywords: [
    'à propos IAHome',
    'mission IAHome',
    'plateforme IA France',
    'démocratiser intelligence artificielle',
    'équipe IAHome',
    'valeurs IAHome',
  ],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
