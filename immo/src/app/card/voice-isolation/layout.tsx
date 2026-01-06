import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Isolation Vocale par IA : Séparez les sources audio avec Demucs v4 | IA Home',
  description: 'Séparez la voix, la batterie, la basse et les autres instruments de vos fichiers audio avec une précision exceptionnelle. Application d\'isolation vocale basée sur Demucs v4 (Hybrid Transformer), le modèle d\'IA de pointe pour la séparation de sources audio. Gratuit, rapide et de qualité professionnelle.',
  keywords: [
    'isolation vocale',
    'isolation vocale IA',
    'isolation vocale gratuite',
    'séparation audio',
    'séparation audio IA',
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
    'mastering audio',
    'IA audio',
    'intelligence artificielle audio',
    'séparation vocale',
    'isolation instruments',
    'audio processing',
    'traitement audio IA',
    'séparer voix musique',
    'extraire voix chanson',
    'isolation vocale en ligne',
    'outil isolation vocale',
    'application isolation vocale',
    'séparation audio professionnelle',
    'Demucs online',
    'isolation vocale Demucs',
    'séparer batterie basse voix',
    'extraction audio IA',
    'séparation stems',
    'isolation vocale qualité studio'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/voice-isolation',
  },
  openGraph: {
    title: 'Isolation Vocale par IA : Séparez les sources audio avec Demucs v4 | IA Home',
    description: 'Séparez la voix, la batterie, la basse et les autres instruments de vos fichiers audio avec une précision exceptionnelle. Application basée sur Demucs v4, le modèle d\'IA de pointe pour la séparation de sources audio. Gratuit et de qualité professionnelle.',
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
    title: 'Isolation Vocale par IA : Séparez les sources audio avec Demucs v4',
    description: 'Séparez la voix, la batterie, la basse et les autres instruments avec une précision exceptionnelle. Basé sur Demucs v4.',
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
