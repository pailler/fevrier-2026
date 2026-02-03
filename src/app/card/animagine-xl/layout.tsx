import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Générer des images anime avec l\'IA – Animagine XL | IA Home',
  description: 'Créez des personnages et visuels anime/manga avec Animagine XL. Modèle SDXL, 5000+ personnages, sans LoRA. Génération d\'images anime par IA gratuite.',
  keywords: [
    'Animagine XL',
    'générer image anime',
    'anime IA',
    'génération anime IA',
    'créer images anime',
    'image anime IA',
    'dessin anime IA',
    'générateur anime',
    'manga IA',
    'stable diffusion anime',
    'générer anime avec IA',
    'waifu',
    'génération manga IA',
    'générer personnages anime',
    'Animagine XL français',
    'générer anime gratuit',
    'créer anime avec IA',
    'génération anime haute qualité',
    'Animagine XL en ligne',
    'créer images personnalisées anime'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/animagine-xl',
  },
  openGraph: {
    title: 'Générer des images anime avec l\'IA – Animagine XL | IA Home',
    description: 'Créez des personnages et visuels anime/manga avec Animagine XL. Modèle SDXL, 5000+ personnages, sans LoRA.',
    url: 'https://iahome.fr/card/animagine-xl',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/animagine-xl.jpg',
        width: 1200,
        height: 630,
        alt: 'Animagine XL - Génération d\'anime et manga par IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Générer des images anime avec l\'IA – Animagine XL | IA Home',
    description: 'Personnages et visuels anime/manga avec Animagine XL. SDXL, 5000+ personnages, sans LoRA. Gratuit.',
    images: ['https://iahome.fr/images/animagine-xl.jpg'],
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

export default function AnimagineXLLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
