import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { getAppSeoLandingJsonLd } from '@/utils/appSeoLandingExample';
import { apprendreAutrementLandingSeo } from '@/data/apprendre-autrement-landing-seo';
import { APPRENDRE_AUTREMENT_PUBLIC_ORIGIN } from '@/utils/productLandingHosts';

/** Landing SEO publique sur apprendre-autrement.iahome.fr (rewrite middleware). */
export const metadata: Metadata = {
  title: apprendreAutrementLandingSeo.headline,
  description: apprendreAutrementLandingSeo.description,
  keywords: [
    'apprendre autrement',
    'éducation adaptée',
    'besoins spécifiques',
    'autisme activités',
    'TDAH jeux éducatifs',
    'IAHome éducation',
  ],
  alternates: {
    canonical: APPRENDRE_AUTREMENT_PUBLIC_ORIGIN,
  },
  openGraph: {
    title: apprendreAutrementLandingSeo.headline,
    description: apprendreAutrementLandingSeo.description,
    url: APPRENDRE_AUTREMENT_PUBLIC_ORIGIN,
    siteName: 'Apprendre Autrement IAHome',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/apprendre-autrement.jpg',
        width: 1200,
        height: 630,
        alt: 'Apprendre Autrement — éducation adaptée IAHome',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: apprendreAutrementLandingSeo.headline,
    description: apprendreAutrementLandingSeo.description,
    images: ['https://iahome.fr/images/apprendre-autrement.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ApprendreAutrementProductLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={getAppSeoLandingJsonLd(apprendreAutrementLandingSeo)} />
      {children}
    </>
  );
}
