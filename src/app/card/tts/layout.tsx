import type { Metadata } from 'next'
import { CardPageJsonLd } from '@/components/CardPageJsonLd'

export const metadata: Metadata = {
  title: 'Synthèse vocale IA – Texte en voix naturelle XTTS v2 | IA Home',
  description:
    'Convertissez du texte en voix naturelle avec Coqui XTTS v2 : 58 voix, 17 langues, clonage vocal, export WAV/MP3. Service open source hébergé sur tts.iahome.fr.',
  keywords: [
    'synthèse vocale',
    'text to speech',
    'TTS',
    'XTTS v2',
    'Coqui TTS',
    'clonage vocal',
    'voix IA',
    'texte en audio',
    'génération vocale',
    'multilingue',
    'synthèse vocale gratuite',
    'synthèse vocale en ligne',
    'text to speech français',
    'voix naturelle IA',
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/tts',
  },
  openGraph: {
    title: 'Synthèse vocale IA – Texte en voix naturelle XTTS v2 | IA Home',
    description:
      '58 voix, 17 langues, clonage vocal et export WAV/MP3. Coqui XTTS v2 open source sur tts.iahome.fr.',
    url: 'https://iahome.fr/card/tts',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/whisper.jpg',
        width: 1200,
        height: 630,
        alt: 'Synthèse vocale IA (TTS) – Coqui XTTS v2 – IA Home',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Synthèse vocale IA – Texte en voix naturelle XTTS v2 | IA Home',
    description: '58 voix, 17 langues, clonage vocal. Coqui XTTS v2 sur tts.iahome.fr.',
    images: ['https://iahome.fr/images/whisper.jpg'],
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
    'application-name': 'Synthèse vocale IA (TTS)',
    'apple-mobile-web-app-title': 'TTS IA',
    'apple-mobile-web-app-capable': 'yes',
    'theme-color': '#16a34a',
  },
}

export default function TtsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CardPageJsonLd slug="tts" />
      {children}
    </>
  )
}
