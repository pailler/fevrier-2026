import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/reset-password',
  title: 'Nouveau mot de passe',
  description: 'Définissez un nouveau mot de passe pour votre compte IAHome.',
  keywords: ['réinitialisation mot de passe IAHome'],
  noindex: true,
});

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
