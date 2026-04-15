import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/apprendre-autrement',
  title: 'Apprendre Autrement — redirection',
  description: 'Accès à l’application Apprendre Autrement IAHome.',
  keywords: ['Apprendre Autrement', 'IAHome éducation'],
  noindex: true,
});

export default function ApprendreAutrementRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
