import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { getAppSeoLandingJsonLd } from '@/utils/appSeoLandingExample';
import { reveilLandingSeo } from '@/data/reveil-landing-seo';
import { REVEIL_PUBLIC_ORIGIN } from '@/utils/productLandingHosts';

/** Landing SEO publique sur reveil.iahome.fr (rewrite middleware). */
export const metadata: Metadata = {
  title: reveilLandingSeo.headline,
  description: reveilLandingSeo.description,
  keywords: [
    'réveil intelligent',
    'alarme météo',
    'jours fériés',
    'réveil mobile',
    'IAHome réveil',
  ],
  alternates: {
    canonical: REVEIL_PUBLIC_ORIGIN,
  },
  openGraph: {
    title: reveilLandingSeo.headline,
    description: reveilLandingSeo.description,
    url: REVEIL_PUBLIC_ORIGIN,
    siteName: 'Réveil Intelligent IAHome',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/reveil-intelligent.svg',
        width: 1200,
        height: 630,
        alt: 'Réveil Intelligent IAHome',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: reveilLandingSeo.headline,
    description: reveilLandingSeo.description,
    images: ['https://iahome.fr/images/reveil-intelligent.svg'],
  },
};

export default function ReveilProductLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = getAppSeoLandingJsonLd(reveilLandingSeo);
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  );
}
