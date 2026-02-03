import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apprendre Autrement – Activités pour enfants à besoins spécifiques | IA Home',
  description: '15 activités éducatives adaptées : multi-sensoriel, badges, encouragement vocal. Pour TDAH, dys, autisme. Apprentissage ludique et bienveillant.',
  keywords: [
    'apprendre autrement',
    'activités enfants besoins spécifiques',
    'activités TDAH',
    'apprentissage dyslexie',
    'éducation inclusive',
    'jeux éducatifs adaptés',
    'éducation adaptée',
    'enfants besoins spécifiques',
    'activités éducatives adaptées',
    'apprentissage différencié',
    'pédagogie adaptée',
    'activités multi-sensorielles',
    'troubles d\'apprentissage',
    'autisme éducation',
    'TDAH activités',
    'dyslexie activités',
    'système de récompenses éducatif',
    'badges éducatifs',
    'encouragement vocal enfants',
    'application éducative enfants',
    'apprentissage personnalisé'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/apprendre-autrement',
  },
  openGraph: {
    title: 'Apprendre Autrement – Activités pour enfants à besoins spécifiques | IA Home',
    description: '15 activités adaptées : multi-sensoriel, badges, encouragement vocal. TDAH, dys, autisme. Ludique et bienveillant.',
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
    title: 'Apprendre Autrement – Activités pour enfants à besoins spécifiques | IA Home',
    description: '15 activités adaptées : multi-sensoriel, badges. TDAH, dys, autisme. Ludique et bienveillant.',
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


