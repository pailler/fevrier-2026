import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/register',
  title: 'Créer un compte — inscription IAHome',
  description:
    'Inscription à la plateforme IAHome : accédez aux outils IA et services après création de compte.',
  keywords: ['inscription IAHome', 'register', 'nouveau compte IA'],
  noindex: true,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
