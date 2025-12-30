import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apprendre Autrement : activités éducatives adaptées pour enfants avec besoins spécifiques | IA Home',
  description: 'Activités interactives et amusantes pour apprendre différemment. Application éducative adaptée aux enfants avec besoins spécifiques : multi-sensoriel, système de points, badges, encouragement vocal. 15 activités progressives.',
  keywords: [
    'apprendre autrement',
    'éducation adaptée',
    'enfants besoins spécifiques',
    'activités éducatives adaptées',
    'apprentissage différencié',
    'pédagogie adaptée',
    'activités multi-sensorielles',
    'éducation inclusive',
    'apprentissage ludique enfants',
    'activités éducatives interactives',
    'système de récompenses éducatif',
    'badges éducatifs',
    'encouragement vocal enfants',
    'application éducative enfants',
    'apprentissage personnalisé',
    'éducation spécialisée',
    'troubles d\'apprentissage',
    'autisme éducation',
    'TDAH activités',
    'dyslexie activités'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/apprendre-autrement',
  },
  openGraph: {
    title: 'Apprendre Autrement : activités éducatives adaptées pour enfants avec besoins spécifiques | IA Home',
    description: 'Activités interactives et amusantes pour apprendre différemment. Application éducative adaptée aux enfants avec besoins spécifiques : multi-sensoriel, système de points, badges, encouragement vocal.',
    url: 'https://iahome.fr/card/apprendre-autrement',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/apprendre-autrement.jpg',
        width: 1200,
        height: 630,
        alt: 'Apprendre Autrement - Activités éducatives adaptées pour enfants avec besoins spécifiques',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Apprendre Autrement : activités éducatives adaptées pour enfants avec besoins spécifiques | IA Home',
    description: 'Activités interactives et amusantes pour apprendre différemment. Application éducative adaptée aux enfants avec besoins spécifiques.',
    images: ['https://iahome.fr/images/apprendre-autrement.jpg'],
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

export default function ApprendreAutrementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


