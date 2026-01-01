import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Isolation Vocale par IA : Séparez les sources audio avec précision | IA Home',
  description: 'Séparez la voix, la batterie, la basse et les autres instruments de vos fichiers audio avec une précision exceptionnelle. Basé sur Demucs v4, un modèle d\'IA de pointe pour la séparation de sources audio.',
  keywords: [
    'Isolation Vocale',
    'séparation audio',
    'Demucs',
    'extraction voix',
    'isolation batterie',
    'extraction basse',
    'séparation sources audio',
    'remixage audio',
    'mastering audio',
    'IA audio',
    'séparation vocale',
    'isolation instruments',
    'audio processing',
    'source separation',
    'stem separation'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/voice-isolation',
  },
  openGraph: {
    title: 'Isolation Vocale par IA : Séparez les sources audio avec précision | IA Home',
    description: 'Séparez la voix, la batterie, la basse et les autres instruments de vos fichiers audio avec une précision exceptionnelle. Basé sur Demucs v4.',
    url: 'https://iahome.fr/card/voice-isolation',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/voice-isolation.jpg',
        width: 1200,
        height: 630,
        alt: 'Isolation Vocale par IA - Séparation de sources audio avec précision',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Isolation Vocale par IA : Séparez les sources audio avec précision | IA Home',
    description: 'Séparez la voix, la batterie, la basse et les autres instruments de vos fichiers audio avec une précision exceptionnelle.',
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
}

export default function VoiceIsolationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
