import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { getAppSeoLandingJsonLd } from '@/utils/appSeoLandingExample';
import { detecteurIaLandingSeo } from '@/data/detecteur-ia-landing-seo';
import { DETECTEUR_IA_PUBLIC_ORIGIN } from '@/utils/productLandingHosts';

/** Landing SEO publique sur detecteur-ia.iahome.fr (rewrite middleware). */
export const metadata: Metadata = {
  title: detecteurIaLandingSeo.headline,
  description: detecteurIaLandingSeo.description,
  keywords: [
    'détecteur IA',
    'détecter ChatGPT',
    'texte généré IA',
    'vérifier contenu IA',
    'IAHome détecteur',
  ],
  alternates: {
    canonical: DETECTEUR_IA_PUBLIC_ORIGIN,
  },
  openGraph: {
    title: detecteurIaLandingSeo.headline,
    description: detecteurIaLandingSeo.description,
    url: DETECTEUR_IA_PUBLIC_ORIGIN,
    siteName: 'Détecteur IA IAHome',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/iahome-logo.png',
        width: 1200,
        height: 630,
        alt: 'Détecteur de contenu IA IAHome',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: detecteurIaLandingSeo.headline,
    description: detecteurIaLandingSeo.description,
    images: ['https://iahome.fr/images/iahome-logo.png'],
  },
};

export default function DetecteurIaProductLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={getAppSeoLandingJsonLd(detecteurIaLandingSeo)} />
      {children}
    </>
  );
}
