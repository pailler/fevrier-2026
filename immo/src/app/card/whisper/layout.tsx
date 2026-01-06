import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Whisper IA : transcription audio, vidéo et OCR avec précision | IA Home',
  description: 'Transformez vos fichiers audio, vidéo et images en texte avec Whisper IA. Transcription audio/vidéo précise avec OpenAI Whisper, reconnaissance de texte (OCR) avec Tesseract. Support multilingue, interface moderne. Parfait pour professionnels, étudiants et créateurs de contenu.',
  keywords: [
    'Whisper IA',
    'transcription audio',
    'transcription vidéo',
    'OCR',
    'reconnaissance de texte',
    'transcription automatique',
    'OpenAI Whisper',
    'Tesseract OCR',
    'transcrire audio en texte',
    'transcrire vidéo en texte',
    'extraire texte image',
    'transcription multilingue',
    'transcription française',
    'sous-titres automatiques',
    'transcription réunion',
    'transcription interview',
    'OCR français',
    'reconnaissance caractères',
    'transcription podcast',
    'transcription cours'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/whisper',
  },
  openGraph: {
    title: 'Whisper IA : transcription audio, vidéo et OCR avec précision | IA Home',
    description: 'Transformez vos fichiers audio, vidéo et images en texte avec Whisper IA. Transcription audio/vidéo précise avec OpenAI Whisper, reconnaissance de texte (OCR) avec Tesseract.',
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
    title: 'Whisper IA : transcription audio, vidéo et OCR avec précision | IA Home',
    description: 'Transformez vos fichiers audio, vidéo et images en texte avec Whisper IA. Transcription audio/vidéo précise avec OpenAI Whisper.',
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


