import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compte rendu de réunion automatique – Transcription + résumé IA | IA Home',
  description: 'Enregistrez, transcrivez et résumez vos réunions. Whisper + GPT, export PDF. Générez des comptes rendus professionnels en quelques clics.',
  keywords: [
    'compte rendu réunion automatique',
    'compte rendus IA',
    'résumé réunion IA',
    'transcription réunion',
    'transcription réunion PDF',
    'rapports réunion automatiques',
    'compte rendu automatique',
    'transcrire réunion',
    'générer rapport réunion',
    'compte rendu réunion IA',
    'transcription réunion automatique',
    'résumé réunion automatique',
    'rapport réunion professionnel',
    'compte rendu réunion français',
    'générer compte rendu réunion',
    'IA réunion',
    'automatisation réunion',
    'compte rendu réunion en ligne',
    'rapport réunion PDF'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/meeting-reports',
  },
  openGraph: {
    title: 'Compte rendu de réunion automatique – Transcription + résumé IA | IA Home',
    description: 'Enregistrez, transcrivez et résumez vos réunions. Whisper + GPT, export PDF. Comptes rendus pro en quelques clics.',
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
    title: 'Compte rendu de réunion automatique – Transcription + résumé IA | IA Home',
    description: 'Transcrivez et résumez vos réunions. Whisper + GPT, export PDF. Comptes rendus pro.',
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


