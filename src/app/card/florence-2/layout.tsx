import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Florence-2 : modèle vision-language unifié par Microsoft | IA Home',
  description: 'Exécutez plus de 10 tâches de vision par ordinateur avec un seul modèle. Captioning, détection d\'objets, segmentation, OCR et bien plus encore. Modèle compact et performant, open source sous licence MIT. Parfait pour développeurs, chercheurs et créateurs de contenu.',
  keywords: [
    'Florence-2',
    'vision-language model',
    'modèle vision unifié',
    'captioning images',
    'détection objets',
    'segmentation images',
    'OCR vision',
    'Microsoft Florence-2',
    'modèle vision IA',
    'Florence-2 français',
    'générer légendes images',
    'détecter objets images',
    'segmenter images',
    'extraire texte images',
    'FLD-5B dataset',
    'modèle vision compact',
    'zero-shot vision',
    'Florence-2 en ligne',
    'vision-language model gratuit',
    'créer annotations images'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/florence-2',
  },
  openGraph: {
    title: 'Florence-2 : modèle vision-language unifié par Microsoft | IA Home',
    description: 'Exécutez plus de 10 tâches de vision par ordinateur avec un seul modèle. Captioning, détection d\'objets, segmentation, OCR et bien plus encore.',
    url: 'https://iahome.fr/card/florence-2',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/florence-2.jpg',
        width: 1200,
        height: 630,
        alt: 'Florence-2 - Modèle vision-language unifié par Microsoft',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Florence-2 : modèle vision-language unifié par Microsoft | IA Home',
    description: 'Exécutez plus de 10 tâches de vision par ordinateur avec un seul modèle. Modèle compact et performant.',
    images: ['https://iahome.fr/images/florence-2.jpg'],
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

export default function Florence2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
