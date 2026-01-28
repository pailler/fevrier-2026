import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BiRefNet : Suppression de fond d\'image parfaite avec IA | IA Home',
  description: 'Supprimez automatiquement les arrière-plans de vos images avec une précision exceptionnelle. BiRefNet sépare parfaitement le premier plan du fond en un seul clic. Support de multiples résolutions (1024x1024, 2048x2048). Parfait pour graphistes, designers et créateurs de contenu.',
  keywords: [
    'BiRefNet',
    'segmentation images',
    'suppression fond',
    'matting images',
    'segmentation dichotomique',
    'extraction premier plan',
    'supprimer arrière-plan',
    'segmentation haute résolution',
    'BiRefNet français',
    'séparer premier plan fond',
    'matting professionnel',
    'segmentation précise',
    'suppression fond IA',
    'extraction objets images',
    'segmentation DIS',
    'segmentation COD',
    'segmentation HRSOD',
    'BiRefNet en ligne',
    'segmentation images gratuit',
    'créer masques transparence'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/birefnet',
  },
  openGraph: {
    title: 'BiRefNet : Suppression de fond d\'image parfaite avec IA | IA Home',
    description: 'Supprimez automatiquement les arrière-plans de vos images avec une précision exceptionnelle. BiRefNet sépare parfaitement le premier plan du fond en un seul clic.',
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
    title: 'BiRefNet : Suppression de fond d\'image parfaite avec IA | IA Home',
    description: 'Séparez efficacement le premier plan du fond dans vos images avec une précision exceptionnelle.',
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
