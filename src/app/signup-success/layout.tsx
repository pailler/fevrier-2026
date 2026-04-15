import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/signup-success',
  title: 'Inscription confirmée — bienvenue sur IAHome',
  description:
    'Votre compte IAHome a été créé. Vérifiez votre e-mail si nécessaire, puis explorez les applications et vos crédits.',
  keywords: ['inscription réussie IAHome', 'compte créé', 'bienvenue IAHome'],
  noindex: true,
});

export default function SignupSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
