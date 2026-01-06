import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compte rendus IA : transformez vos réunions en rapports professionnels automatiquement | IA Home',
  description: 'Transformez automatiquement vos réunions en rapports professionnels avec Compte rendus IA. Enregistrement audio, transcription automatique avec Whisper, résumé intelligent avec GPT, export PDF. Gain de temps considérable pour équipes et professionnels.',
  keywords: [
    'compte rendus IA',
    'rapports réunion automatiques',
    'transcription réunion',
    'résumé réunion IA',
    'compte rendu automatique',
    'transcrire réunion',
    'générer rapport réunion',
    'réunion automatique',
    'compte rendu réunion IA',
    'transcription réunion automatique',
    'résumé réunion automatique',
    'rapport réunion professionnel',
    'compte rendu réunion français',
    'transcrire réunion en texte',
    'générer compte rendu réunion',
    'IA réunion',
    'automatisation réunion',
    'compte rendu réunion en ligne',
    'transcription audio réunion',
    'rapport réunion PDF'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/meeting-reports',
  },
  openGraph: {
    title: 'Compte rendus IA : transformez vos réunions en rapports professionnels automatiquement | IA Home',
    description: 'Transformez automatiquement vos réunions en rapports professionnels avec Compte rendus IA. Enregistrement audio, transcription automatique avec Whisper, résumé intelligent avec GPT.',
    url: 'https://iahome.fr/card/meeting-reports',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/meeting-reports.jpg',
        width: 1200,
        height: 630,
        alt: 'Compte rendus IA - Transformez vos réunions en rapports professionnels automatiquement',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Compte rendus IA : transformez vos réunions en rapports professionnels automatiquement | IA Home',
    description: 'Transformez automatiquement vos réunions en rapports professionnels avec Compte rendus IA. Enregistrement audio, transcription automatique avec Whisper.',
    images: ['https://iahome.fr/images/meeting-reports.jpg'],
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

export default function MeetingReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


