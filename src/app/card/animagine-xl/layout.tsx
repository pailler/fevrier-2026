import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Animagine XL : génération d\'anime et manga par IA | IA Home',
  description: 'Créez des images d\'anime et de manga de haute qualité avec Animagine XL. Modèle SDXL super-optimisé, connaissance de 5000+ personnages d\'anime, génération rapide sans LoRA requis. Parfait pour les amateurs d\'anime, artistes et créateurs de contenu.',
  keywords: [
    'Animagine XL',
    'génération anime IA',
    'créer images anime',
    'génération manga IA',
    'stable diffusion anime',
    'générer anime avec IA',
    'IA génération anime',
    'créer anime avec IA',
    'génération anime haute qualité',
    'Animagine XL français',
    'générer personnages anime',
    'créer visuels anime',
    'génération anime artistiques',
    'IA création anime',
    'générer images manga',
    'créer illustrations anime',
    'génération anime marketing',
    'Animagine XL en ligne',
    'générer anime gratuit',
    'créer images personnalisées anime'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/animagine-xl',
  },
  openGraph: {
    title: 'Animagine XL : génération d\'anime et manga par IA | IA Home',
    description: 'Créez des images d\'anime et de manga de haute qualité avec Animagine XL. Modèle SDXL super-optimisé, connaissance de 5000+ personnages d\'anime.',
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
    title: 'Animagine XL : génération d\'anime et manga par IA | IA Home',
    description: 'Créez des images d\'anime et de manga de haute qualité avec Animagine XL. Modèle SDXL super-optimisé.',
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
