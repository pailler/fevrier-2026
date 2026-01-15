import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apprendre le code aux enfants : programmation ludique (6 à 14 ans) | IA Home',
  description: 'Apprenez la programmation en vous amusant ! Exercices interactifs et progressifs avec une progression par âge (6 à 14 ans). Découvrez les bases du code : variables, boucles, conditions, logique, fonctions, tableaux, objets.',
  keywords: [
    'apprendre le code aux enfants',
    'programmation enfants',
    'code pour enfants',
    'apprendre la programmation',
    'initiation programmation enfants',
    'cours code enfants',
    'programmation ludique',
    'apprendre à coder enfant',
    'exercices programmation enfants',
    'variables programmation',
    'boucles programmation',
    'conditions programmation',
    'fonctions programmation',
    'code informatique enfants',
    'programmation 6-14 ans',
    'apprendre javascript enfant',
    'initiation informatique enfants',
    'coding kids',
    'programmation éducative',
    'jeux programmation enfants'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/code-learning',
  },
  openGraph: {
    title: 'Apprendre le code aux enfants : programmation ludique (6 à 14 ans) | IA Home',
    description: 'Apprenez la programmation en vous amusant ! Exercices interactifs et progressifs avec une progression par âge (6 à 14 ans). Variables, boucles, conditions, logique, fonctions, tableaux, objets.',
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
    title: 'Apprendre le code aux enfants : programmation ludique (6 à 14 ans) | IA Home',
    description: 'Apprenez la programmation en vous amusant ! Exercices interactifs et progressifs avec une progression par âge (6 à 14 ans).',
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


