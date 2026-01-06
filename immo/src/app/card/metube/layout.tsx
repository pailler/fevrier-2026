import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MeTube : télécharger des vidéos YouTube gratuitement et en privé | IA Home',
  description: 'Téléchargez vos vidéos YouTube préférées gratuitement et en privé avec MeTube. Téléchargement, conversion de formats, gestion de bibliothèque. Solution open-source sans publicité, respectueuse de la vie privée.',
  keywords: [
    'télécharger vidéo YouTube',
    'télécharger YouTube',
    'download YouTube',
    'télécharger vidéo YouTube gratuit',
    'télécharger YouTube sans publicité',
    'convertisseur YouTube',
    'télécharger playlist YouTube',
    'MeTube',
    'télécharger YouTube MP4',
    'télécharger YouTube MP3',
    'télécharger vidéo YouTube privé',
    'télécharger YouTube open source',
    'télécharger YouTube français',
    'télécharger vidéo YouTube HD',
    'télécharger sous-titres YouTube',
    'télécharger YouTube playlist',
    'télécharger YouTube gratuit',
    'alternative YouTube downloader',
    'télécharger vidéo YouTube sécurisé',
    'télécharger YouTube RGPD'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/metube',
  },
  openGraph: {
    title: 'MeTube : télécharger des vidéos YouTube gratuitement et en privé | IA Home',
    description: 'Téléchargez vos vidéos YouTube préférées gratuitement et en privé avec MeTube. Téléchargement, conversion de formats, gestion de bibliothèque. Solution open-source sans publicité.',
    url: 'https://iahome.fr/card/metube',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/metube-module.jpg',
        width: 1200,
        height: 630,
        alt: 'MeTube - Télécharger des vidéos YouTube gratuitement et en privé',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'MeTube : télécharger des vidéos YouTube gratuitement et en privé | IA Home',
    description: 'Téléchargez vos vidéos YouTube préférées gratuitement et en privé avec MeTube. Téléchargement, conversion de formats, gestion de bibliothèque.',
    images: ['https://iahome.fr/images/metube-module.jpg'],
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

export default function MeTubeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


