import type { Metadata } from 'next';
import { buildPageSeo } from '@/utils/pageMetadata';

export const metadata: Metadata = buildPageSeo({
  path: '/cookies',
  title: 'Politique cookies — IAHome',
  description:
    'Informations sur les cookies utilisés sur iahome.fr : finalités, durée de conservation et gestion de vos choix.',
  keywords: [
    'cookies IAHome',
    'politique cookies',
    'traceurs site',
    'consentement cookies',
    'RGPD cookies',
  ],
});

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
