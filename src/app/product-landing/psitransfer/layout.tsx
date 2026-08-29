import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { getAppSeoLandingJsonLd } from '@/utils/appSeoLandingExample';
import { psitransferLandingSeo } from '@/data/psitransfer-landing-seo';
import { PSITRANSFER_PUBLIC_ORIGIN } from '@/utils/productLandingHosts';

/** Landing SEO publique sur psitransfer.iahome.fr (rewrite middleware). */
export const metadata: Metadata = {
  title: psitransferLandingSeo.headline,
  description: psitransferLandingSeo.description,
  keywords: [
    'transfert fichier',
    'partage fichier sécurisé',
    'alternative wetransfer',
    'envoi fichier volumineux',
    'upload fichier privé',
    'PsiTransfer IAHome',
  ],
  alternates: {
    canonical: PSITRANSFER_PUBLIC_ORIGIN,
  },
  openGraph: {
    title: psitransferLandingSeo.headline,
    description: psitransferLandingSeo.description,
    url: PSITRANSFER_PUBLIC_ORIGIN,
    siteName: 'PsiTransfer IAHome',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/psitransfer-module.jpg',
        width: 1200,
        height: 630,
        alt: 'PsiTransfer — transfert de fichiers sécurisé IAHome',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: psitransferLandingSeo.headline,
    description: psitransferLandingSeo.description,
    images: ['https://iahome.fr/images/psitransfer-module.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PsiTransferProductLandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={getAppSeoLandingJsonLd(psitransferLandingSeo)} />
      {children}
    </>
  );
}
