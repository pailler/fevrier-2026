import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transcrire audio et vidéo en texte – Whisper IA | IA Home',
  description: 'Transcription audio/vidéo en texte avec OpenAI Whisper. Multilingue, OCR sur images. Sous-titres et transcription de réunions ou podcasts.',
  keywords: [
    'Whisper IA',
    'transcrire audio en texte',
    'transcription audio',
    'transcription vidéo',
    'transcrire audio gratuit',
    'sous-titres automatiques',
    'transcription réunion',
    'speech to text français',
    'OpenAI Whisper',
    'transcription automatique',
    'transcrire vidéo en texte',
    'OCR',
    'reconnaissance de texte',
    'Tesseract OCR',
    'extraire texte image',
    'transcription multilingue',
    'transcription podcast',
    'transcription interview',
    'transcription cours'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/whisper',
  },
  openGraph: {
    title: 'Transcrire audio et vidéo en texte – Whisper IA | IA Home',
    description: 'Transcription audio/vidéo avec OpenAI Whisper. Multilingue, OCR. Sous-titres et transcription réunions, podcasts.',
    url: 'https://iahome.fr/card/whisper',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/whisper.jpg',
        width: 1200,
        height: 630,
        alt: 'Whisper IA - Transcription audio, vidéo et OCR avec précision',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Transcrire audio et vidéo en texte – Whisper IA | IA Home',
    description: 'Transcription audio/vidéo avec OpenAI Whisper. Multilingue, OCR. Réunions, podcasts.',
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
}

export default function WhisperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


