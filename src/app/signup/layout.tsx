import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/signup',
  title: 'Inscription gratuite — créer un compte IAHome',
  description:
    'Créez votre compte IAHome pour tester les applications IA, recevoir des crédits et accéder à la domotique, à la transcription, aux images et aux outils PDF.',
  keywords: [
    'inscription IAHome',
    'créer compte IA',
    'compte gratuit IA',
    's’inscrire plateforme IA',
    'essai IA France',
  ],
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
