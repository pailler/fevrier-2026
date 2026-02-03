import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Supprimer le fond d\'une image – BiRefNet IA | IA Home',
  description: 'Retirez l\'arrière-plan de vos photos en un clic avec BiRefNet. Détourage précis, export PNG transparent. Idéal graphistes, e-commerce et réseaux sociaux.',
  keywords: [
    'BiRefNet',
    'supprimer fond image',
    'enlever fond photo',
    'suppression fond',
    'détourage image',
    'fond transparent',
    'remove background',
    'retirer arrière-plan',
    'supprimer arrière-plan',
    'segmentation images',
    'extraction premier plan',
    'BiRefNet français',
    'séparer premier plan fond',
    'suppression fond IA',
    'créer masques transparence',
    'BiRefNet en ligne',
    'segmentation images gratuit',
    'détourage automatique'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/birefnet',
  },
  openGraph: {
    title: 'Supprimer le fond d\'une image – BiRefNet IA | IA Home',
    description: 'Retirez l\'arrière-plan de vos photos en un clic. Détourage précis, export PNG transparent. Graphistes, e-commerce.',
    url: 'https://iahome.fr/card/birefnet',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/birefnet.jpg',
        width: 1200,
        height: 630,
        alt: 'BiRefNet - Suppression de fond d\'image parfaite avec IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Supprimer le fond d\'une image – BiRefNet IA | IA Home',
    description: 'Arrière-plan en un clic. Détourage précis, PNG transparent. Graphistes, e-commerce.',
    images: ['https://iahome.fr/images/birefnet.jpg'],
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

export default function BiRefNetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
