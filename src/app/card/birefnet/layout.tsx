import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BiRefNet : segmentation d\'images dichotomique haute résolution | IA Home',
  description: 'Séparez efficacement le premier plan du fond dans vos images avec une précision exceptionnelle. Performance SOTA sur DIS, COD et HRSOD. Support de multiples résolutions (1024x1024, 2048x2048). Parfait pour graphistes, designers et développeurs.',
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
    title: 'BiRefNet : segmentation d\'images dichotomique haute résolution | IA Home',
    description: 'Séparez efficacement le premier plan du fond dans vos images avec une précision exceptionnelle. Performance SOTA sur DIS, COD et HRSOD.',
    url: 'https://iahome.fr/card/birefnet',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/birefnet.jpg',
        width: 1200,
        height: 630,
        alt: 'BiRefNet - Segmentation d\'images dichotomique haute résolution',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'BiRefNet : segmentation d\'images dichotomique haute résolution | IA Home',
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
