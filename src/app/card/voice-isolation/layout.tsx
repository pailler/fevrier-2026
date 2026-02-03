import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Séparer voix et musique – Isolation vocale Demucs v4 | IA Home',
  description: 'Isolez la voix, la batterie et la basse de n\'importe quel audio. Demucs v4, qualité studio. Karaoké, remix et création musicale. Gratuit.',
  keywords: [
    'séparer voix musique',
    'extraire voix d\'une chanson',
    'isolation vocale',
    'stem splitter',
    'vocal isolation',
    'karaoké IA',
    'isolation vocale IA',
    'isolation vocale gratuite',
    'séparation audio',
    'Demucs',
    'Demucs v4',
    'HTDemucs',
    'extraction voix',
    'extraction vocale',
    'isolation batterie',
    'extraction basse',
    'séparation sources audio',
    'stem separation',
    'source separation',
    'remixage audio',
    'séparer batterie basse voix',
    'extraction audio IA',
    'séparation stems',
    'isolation vocale en ligne',
    'Demucs online',
    'isolation vocale Demucs',
    'isolation vocale qualité studio'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/voice-isolation',
  },
  openGraph: {
    title: 'Séparer voix et musique – Isolation vocale Demucs v4 | IA Home',
    description: 'Isolez la voix, la batterie et la basse de n\'importe quel audio. Demucs v4, qualité studio. Karaoké, remix. Gratuit.',
    url: 'https://iahome.fr/card/voice-isolation',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/voice-isolation.jpg',
        width: 1200,
        height: 630,
        alt: 'Isolation Vocale par IA - Séparation de sources audio avec Demucs v4 - IA Home',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Séparer voix et musique – Isolation vocale Demucs v4 | IA Home',
    description: 'Isolez voix, batterie et basse. Demucs v4, qualité studio. Karaoké, remix. Gratuit.',
    images: ['https://iahome.fr/images/voice-isolation.jpg'],
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
  authors: [{ name: 'IA Home' }],
  creator: 'IA Home',
  publisher: 'IA Home',
  category: 'Audio Processing',
  classification: 'Web Application',
  other: {
    'application-name': 'Isolation Vocale par IA',
    'apple-mobile-web-app-title': 'Isolation Vocale',
    'apple-mobile-web-app-capable': 'yes',
    'theme-color': '#9333ea',
  },
}

export default function VoiceIsolationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
