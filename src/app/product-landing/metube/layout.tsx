import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { getAppSeoLandingJsonLd } from '@/utils/appSeoLandingExample';
import { metubeLandingSeo } from '@/data/metube-landing-seo';
import { METUBE_PUBLIC_ORIGIN } from '@/utils/productLandingHosts';

/** Landing SEO publique sur metube.iahome.fr (rewrite middleware). */
export const metadata: Metadata = {
  title: metubeLandingSeo.headline,
  description: metubeLandingSeo.description,
  keywords: [
    'télécharger vidéo YouTube',
    'youtube mp3',
    'youtube mp4',
    'téléchargement playlist YouTube',
    'MeTube IAHome',
    'youtube sans pub',
  ],
  alternates: {
    canonical: METUBE_PUBLIC_ORIGIN,
  },
  openGraph: {
    title: metubeLandingSeo.headline,
    description: metubeLandingSeo.description,
    url: METUBE_PUBLIC_ORIGIN,
    siteName: 'MeTube IAHome',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/metube-module.jpg',
        width: 1200,
        height: 630,
        alt: 'MeTube — téléchargement YouTube privé IAHome',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: metubeLandingSeo.headline,
    description: metubeLandingSeo.description,
    images: ['https://iahome.fr/images/metube-module.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MeTubeProductLandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={getAppSeoLandingJsonLd(metubeLandingSeo)} />
      {children}
    </>
  );
}
