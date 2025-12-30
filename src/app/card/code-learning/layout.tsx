import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apprendre le code aux enfants : programmation ludique pour enfants de 8 à 12 ans | IA Home',
  description: 'Apprenez la programmation en vous amusant ! Exercices interactifs et progressifs pour enfants de 8 à 12 ans. Découvrez les bases du code : variables, boucles, conditions, fonctions. Interface ludique et colorée.',
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
    'programmation 8-12 ans',
    'apprendre python enfant',
    'initiation informatique enfants',
    'coding kids',
    'programmation éducative',
    'jeux programmation enfants'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/code-learning',
  },
  openGraph: {
    title: 'Apprendre le code aux enfants : programmation ludique pour enfants de 8 à 12 ans | IA Home',
    description: 'Apprenez la programmation en vous amusant ! Exercices interactifs et progressifs pour enfants de 8 à 12 ans. Découvrez les bases du code : variables, boucles, conditions, fonctions.',
    url: 'https://iahome.fr/card/code-learning',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/code-learning.jpg',
        width: 1200,
        height: 630,
        alt: 'Apprendre le code aux enfants - Programmation ludique pour enfants de 8 à 12 ans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Apprendre le code aux enfants : programmation ludique pour enfants de 8 à 12 ans | IA Home',
    description: 'Apprenez la programmation en vous amusant ! Exercices interactifs et progressifs pour enfants de 8 à 12 ans.',
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


