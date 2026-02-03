import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Télécharger vidéo YouTube – MP4, MP3, gratuit et privé | IA Home',
  description: 'Téléchargez des vidéos et playlists YouTube en MP4/MP3. Sans pub, open source, respect de la vie privée. MeTube, alternative française.',
  keywords: [
    'télécharger vidéo YouTube',
    'télécharger YouTube',
    'download YouTube',
    'youtube to mp4',
    'télécharger playlist youtube',
    'download youtube français',
    'télécharger vidéo YouTube gratuit',
    'télécharger YouTube MP4',
    'télécharger YouTube MP3',
    'MeTube',
    'télécharger YouTube sans publicité',
    'convertisseur YouTube',
    'télécharger vidéo YouTube privé',
    'télécharger YouTube open source',
    'télécharger vidéo YouTube HD',
    'télécharger sous-titres YouTube',
    'alternative YouTube downloader',
    'télécharger YouTube gratuit',
    'télécharger YouTube RGPD'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/metube',
  },
  openGraph: {
    title: 'Télécharger vidéo YouTube – MP4, MP3, gratuit et privé | IA Home',
    description: 'Vidéos et playlists YouTube en MP4/MP3. Sans pub, open source, vie privée. MeTube, alternative française.',
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
    title: 'Télécharger vidéo YouTube – MP4, MP3, gratuit et privé | IA Home',
    description: 'Vidéos et playlists YouTube en MP4/MP3. Sans pub, open source. MeTube.',
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


