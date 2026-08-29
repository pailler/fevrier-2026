import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { getAppSeoLandingJsonLd } from '@/utils/appSeoLandingExample';
import { resasSystemLandingSeo } from '@/data/resas-system-landing-seo';
import { RESAS_SYSTEM_PUBLIC_ORIGIN } from '@/utils/productLandingHosts';

/** Landing SEO publique sur resas.iahome.fr (rewrite middleware). */
export const metadata: Metadata = {
  title: resasSystemLandingSeo.headline,
  description: resasSystemLandingSeo.description,
  keywords: [
    'réservation matériel',
    'emprunt équipements',
    'calendrier réservation',
    'jeux vidéo prêt',
    'Resas IAHome',
    'labo numérique',
  ],
  alternates: {
    canonical: RESAS_SYSTEM_PUBLIC_ORIGIN,
  },
  openGraph: {
    title: resasSystemLandingSeo.headline,
    description: resasSystemLandingSeo.description,
    url: RESAS_SYSTEM_PUBLIC_ORIGIN,
    siteName: 'Réservation matériel IAHome',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/resas-system.svg',
        width: 1200,
        height: 630,
        alt: 'Réservation matériel — IAHome',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: resasSystemLandingSeo.headline,
    description: resasSystemLandingSeo.description,
    images: ['https://iahome.fr/images/resas-system.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ResasSystemProductLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={getAppSeoLandingJsonLd(resasSystemLandingSeo)} />
      {children}
    </>
  );
}
