import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Test de vitesse internet – Débit, ping, fibre | IA Home',
  description: 'Mesurez votre débit (download/upload) et votre latence. Test gratuit, sans pub, open source. Vérifiez votre connexion fibre ou ADSL.',
  keywords: [
    'test vitesse internet',
    'test débit internet',
    'test débit fibre',
    'speed test français',
    'test connexion internet',
    'speed test',
    'mesurer débit',
    'test bande passante',
    'mesure débit internet',
    'test vitesse fibre',
    'test vitesse ADSL',
    'test ping',
    'test latence',
    'test upload download',
    'LibreSpeed',
    'test vitesse gratuit',
    'test vitesse sans publicité',
    'test vitesse open source',
    'test vitesse RGPD',
    'test vitesse français'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/librespeed',
  },
  openGraph: {
    title: 'Test de vitesse internet – Débit, ping, fibre | IA Home',
    description: 'Mesurez débit (download/upload) et latence. Test gratuit, sans pub, open source. Fibre ou ADSL.',
    url: 'https://iahome.fr/card/librespeed',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/librespeed.jpg',
        width: 1200,
        height: 630,
        alt: 'LibreSpeed - Test de vitesse internet rapide et précis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Test de vitesse internet – Débit, ping, fibre | IA Home',
    description: 'Mesurez débit et latence. Test gratuit, sans pub. Fibre ou ADSL.',
    images: ['https://iahome.fr/images/librespeed.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function LibreSpeedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


