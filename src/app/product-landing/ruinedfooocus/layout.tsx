import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { getAppSeoLandingJsonLd } from '@/utils/appSeoLandingExample';
import { ruinedFooocusLandingSeo } from '@/data/ruinedfooocus-landing-seo';
import { RUINEDFOOOCUS_PUBLIC_ORIGIN } from '@/utils/productLandingHosts';

/** Landing SEO publique sur ruinedfooocus.iahome.fr (rewrite middleware). */
export const metadata: Metadata = {
  title: ruinedFooocusLandingSeo.headline,
  description: ruinedFooocusLandingSeo.description,
  keywords: [
    'génération image IA',
    'RuinedFooocus',
    'text to image',
    'Stable Diffusion simple',
    'créer image IA',
    'Fooocus IAHome',
  ],
  alternates: {
    canonical: RUINEDFOOOCUS_PUBLIC_ORIGIN,
  },
  openGraph: {
    title: ruinedFooocusLandingSeo.headline,
    description: ruinedFooocusLandingSeo.description,
    url: RUINEDFOOOCUS_PUBLIC_ORIGIN,
    siteName: 'RuinedFooocus IAHome',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/ruinedfooocus.jpg',
        width: 1200,
        height: 630,
        alt: 'RuinedFooocus — génération d’images IA IAHome',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: ruinedFooocusLandingSeo.headline,
    description: ruinedFooocusLandingSeo.description,
    images: ['https://iahome.fr/images/ruinedfooocus.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RuinedFooocusProductLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={getAppSeoLandingJsonLd(ruinedFooocusLandingSeo)} />
      {children}
    </>
  );
}
