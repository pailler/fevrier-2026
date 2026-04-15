import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/forgot-password',
  title: 'Mot de passe oublié',
  description: 'Réinitialisez le mot de passe de votre compte IAHome via e-mail sécurisé.',
  keywords: ['mot de passe oublié IAHome', 'réinitialiser mot de passe'],
  noindex: true,
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
