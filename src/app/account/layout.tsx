import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/account',
  title: 'Mon compte — paramètres IAHome',
  description: 'Paramètres et informations de votre compte utilisateur IAHome.',
  keywords: ['compte IAHome', 'paramètres compte'],
  noindex: true,
});

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
