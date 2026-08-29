import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';

import { getAppSeoLandingJsonLd } from '@/utils/appSeoLandingExample';

import { photoboothLandingSeo } from '@/data/photobooth-landing-seo';

import { PHOTOBOOTH_PUBLIC_ORIGIN } from '@/utils/productLandingHosts';



/** Landing SEO publique sur photobooth.iahome.fr (rewrite middleware). */

export const metadata: Metadata = {

  title: photoboothLandingSeo.headline,

  description: photoboothLandingSeo.description,

  keywords: [

    'photobooth événement',

    'borne photo en ligne',

    'photobooth connecté',

    'animation photo mariage',

    'photobooth entreprise',

    'galerie photo événement',

  ],

  alternates: {

    canonical: PHOTOBOOTH_PUBLIC_ORIGIN,

  },

  openGraph: {

    title: photoboothLandingSeo.headline,

    description: photoboothLandingSeo.description,

    url: PHOTOBOOTH_PUBLIC_ORIGIN,

    siteName: 'Photobooth IAHome',

    locale: 'fr_FR',

    type: 'website',

    images: [

      {

        url: 'https://iahome.fr/images/photobooth.png',

        width: 1200,

        height: 630,

        alt: 'Photobooth connecté pour événements — IAHome',

      },

    ],

  },

  twitter: {

    card: 'summary_large_image',

    title: photoboothLandingSeo.headline,

    description: photoboothLandingSeo.description,

    images: ['https://iahome.fr/images/photobooth.png'],

  },

  robots: {

    index: true,

    follow: true,

  },

};



export default function PhotoboothProductLandingLayout({ children }: { children: React.ReactNode }) {

  return (

    <>

      <JsonLd data={getAppSeoLandingJsonLd(photoboothLandingSeo)} />

      {children}

    </>

  );

}


