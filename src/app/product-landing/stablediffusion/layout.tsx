import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { getAppSeoLandingJsonLd } from '@/utils/appSeoLandingExample';
import { stableDiffusionLandingSeo } from '@/data/stablediffusion-landing-seo';
import { STABLEDIFFUSION_PUBLIC_ORIGIN } from '@/utils/productLandingHosts';

/** Landing SEO publique sur stablediffusion.iahome.fr (rewrite middleware). */
export const metadata: Metadata = {
  title: stableDiffusionLandingSeo.headline,
  description: stableDiffusionLandingSeo.description,
  keywords: [
    'Stable Diffusion',
    'génération image IA',
    'text to image',
    'créer image IA',
    'IAHome Stable Diffusion',
  ],
  alternates: {
    canonical: STABLEDIFFUSION_PUBLIC_ORIGIN,
  },
  openGraph: {
    title: stableDiffusionLandingSeo.headline,
    description: stableDiffusionLandingSeo.description,
    url: STABLEDIFFUSION_PUBLIC_ORIGIN,
    siteName: 'Stable Diffusion IAHome',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/stablediffusion.jpg',
        width: 1200,
        height: 630,
        alt: 'Stable Diffusion IAHome',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: stableDiffusionLandingSeo.headline,
    description: stableDiffusionLandingSeo.description,
    images: ['https://iahome.fr/images/stablediffusion.jpg'],
  },
};

export default function StableDiffusionProductLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={getAppSeoLandingJsonLd(stableDiffusionLandingSeo)} />
      {children}
    </>
  );
}
