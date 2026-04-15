import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/contact',
  title: 'Contact — support et partenariats IAHome',
  description:
    'Contactez IAHome pour le support utilisateur, la presse, un partenariat ou une question sur les applications IA et la plateforme.',
  keywords: [
    'contact IAHome',
    'support IAHome',
    'assistance plateforme IA',
    'écrire IAHome',
    'partenariat IA',
  ],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
