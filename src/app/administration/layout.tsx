import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/administration',
  title: 'Annuaire des administrations — services publics numériques',
  description:
    'Accès rapide aux services en ligne des administrations françaises : liens officiels, QR codes et informations utiles. Page de référence IAHome.',
  keywords: [
    'services publics numériques',
    'administration en ligne',
    'démarches administratives',
    'annuaire administration',
    'FranceConnect',
    'IAHome administration',
  ],
});

export default function AdministrationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
