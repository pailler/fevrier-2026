import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apprendre à coder pour les enfants – 6–14 ans | IA Home',
  description: 'Initiation à la programmation pour les 6–14 ans. Variables, boucles, conditions en s\'amusant. Exercices progressifs, pas de compte requis.',
  keywords: [
    'apprendre à coder enfant',
    'coder enfant',
    'programmation enfants',
    'scratch alternative',
    'initiation programmation',
    'coding kids français',
    'apprendre le code aux enfants',
    'code pour enfants',
    'apprendre la programmation',
    'initiation programmation enfants',
    'cours code enfants',
    'programmation ludique',
    'exercices programmation enfants',
    'variables programmation',
    'boucles programmation',
    'conditions programmation',
    'programmation 6-14 ans',
    'apprendre javascript enfant',
    'programmation éducative',
    'jeux programmation enfants'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/code-learning',
  },
  openGraph: {
    title: 'Apprendre à coder pour les enfants – 6–14 ans | IA Home',
    description: 'Initiation à la programmation 6–14 ans. Variables, boucles, conditions en s\'amusant. Exercices progressifs, pas de compte.',
    url: 'https://iahome.fr/card/code-learning',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/code-learning.jpg',
        width: 1200,
        height: 630,
        alt: 'Apprendre le code aux enfants - Programmation ludique (6 à 14 ans)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Apprendre à coder pour les enfants – 6–14 ans | IA Home',
    description: 'Initiation programmation 6–14 ans. Variables, boucles, conditions en s\'amusant. Pas de compte.',
    images: ['https://iahome.fr/images/code-learning.jpg'],
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

export default function CodeLearningLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


