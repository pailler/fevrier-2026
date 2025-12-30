import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LibreSpeed : test de vitesse internet rapide et précis | IA Home',
  description: 'Testez votre débit internet avec LibreSpeed : mesure précise du téléchargement, upload et latence. Test de vitesse internet gratuit, open-source, sans publicité et respectueux de la vie privée.',
  keywords: [
    'test vitesse internet',
    'test débit internet',
    'test connexion internet',
    'speed test',
    'test bande passante',
    'mesure débit internet',
    'test vitesse fibre',
    'test vitesse ADSL',
    'test ping',
    'test latence',
    'test upload download',
    'LibreSpeed',
    'test vitesse gratuit',
    'test internet rapide',
    'test connexion précise',
    'test vitesse sans publicité',
    'test vitesse open source',
    'test vitesse privé',
    'test vitesse RGPD',
    'test vitesse français'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/librespeed',
  },
  openGraph: {
    title: 'LibreSpeed : test de vitesse internet rapide et précis | IA Home',
    description: 'Testez votre débit internet avec LibreSpeed : mesure précise du téléchargement, upload et latence. Test de vitesse internet gratuit, open-source, sans publicité.',
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
    title: 'LibreSpeed : test de vitesse internet rapide et précis | IA Home',
    description: 'Testez votre débit internet avec LibreSpeed : mesure précise du téléchargement, upload et latence.',
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


