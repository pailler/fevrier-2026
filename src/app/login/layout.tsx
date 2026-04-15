import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildPageSeo({
  path: '/login',
  title: 'Connexion — compte IAHome',
  description:
    'Connectez-vous à IAHome pour accéder à vos applications IA, crédits et services (transcription, images, PDF, domotique…).',
  keywords: ['connexion IAHome', 'se connecter', 'compte utilisateur IAHome'],
  noindex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
