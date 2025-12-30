import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stable Diffusion : génération d\'images par IA de haute qualité | IA Home',
  description: 'Créez des images de haute qualité avec Stable Diffusion. Génération d\'images par IA à partir de descriptions textuelles, qualité professionnelle, résolution jusqu\'à 1024x1024. Parfait pour artistes, designers, marketing et créateurs de contenu.',
  keywords: [
    'Stable Diffusion',
    'génération images IA',
    'créer images IA',
    'génération images par IA',
    'text to image',
    'générer images avec IA',
    'IA génération images',
    'créer images avec IA',
    'génération images haute qualité',
    'Stable Diffusion français',
    'générer images professionnelles',
    'créer visuels IA',
    'génération images artistiques',
    'IA création images',
    'générer images photoréalistes',
    'créer illustrations IA',
    'génération images marketing',
    'Stable Diffusion en ligne',
    'générer images gratuit',
    'créer images personnalisées'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/stablediffusion',
  },
  openGraph: {
    title: 'Stable Diffusion : génération d\'images par IA de haute qualité | IA Home',
    description: 'Créez des images de haute qualité avec Stable Diffusion. Génération d\'images par IA à partir de descriptions textuelles, qualité professionnelle, résolution jusqu\'à 1024x1024.',
    url: 'https://iahome.fr/card/stablediffusion',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/stablediffusion.jpg',
        width: 1200,
        height: 630,
        alt: 'Stable Diffusion - Génération d\'images par IA de haute qualité',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Stable Diffusion : génération d\'images par IA de haute qualité | IA Home',
    description: 'Créez des images de haute qualité avec Stable Diffusion. Génération d\'images par IA à partir de descriptions textuelles.',
    images: ['https://iahome.fr/images/stablediffusion.jpg'],
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

export default function StableDiffusionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


