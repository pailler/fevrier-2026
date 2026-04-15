import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/terms',
  title: 'Conditions générales d’utilisation — CGU IAHome',
  description:
    'Conditions générales d’utilisation de la plateforme IAHome : compte, crédits, services, responsabilités et droits des utilisateurs.',
  keywords: [
    'CGU IAHome',
    'conditions utilisation',
    'mentions légales service',
    'contrat utilisateur IAHome',
  ],
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
