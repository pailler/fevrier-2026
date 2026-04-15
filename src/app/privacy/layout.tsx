import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/privacy',
  title: 'Politique de confidentialité — données personnelles',
  description:
    'Comment IAHome traite vos données personnelles : hébergement, finalités, droits RGPD et contact DPO ou responsable du traitement.',
  keywords: [
    'confidentialité IAHome',
    'données personnelles',
    'RGPD IAHome',
    'politique confidentialité',
    'protection données',
  ],
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
