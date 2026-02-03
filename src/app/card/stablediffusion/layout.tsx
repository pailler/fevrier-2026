import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Générer des images avec l\'IA – Stable Diffusion | IA Home',
  description: 'Créez des images à partir de texte avec Stable Diffusion. Haute qualité, jusqu\'à 1024×1024. Génération d\'images IA pour créateurs et pros.',
  keywords: [
    'Stable Diffusion',
    'générer image IA',
    'text to image',
    'générer image à partir texte',
    'stable diffusion en ligne',
    'création image IA',
    'génération images IA',
    'créer images IA',
    'génération images par IA',
    'générer images avec IA',
    'IA génération images',
    'génération images haute qualité',
    'Stable Diffusion français',
    'générer images professionnelles',
    'générer images gratuit',
    'créer images personnalisées',
    'générer images photoréalistes',
    'créer illustrations IA',
    'génération images marketing'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/stablediffusion',
  },
  openGraph: {
    title: 'Générer des images avec l\'IA – Stable Diffusion | IA Home',
    description: 'Images à partir de texte avec Stable Diffusion. Haute qualité, 1024×1024. Génération IA pour créateurs et pros.',
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
    title: 'Générer des images avec l\'IA – Stable Diffusion | IA Home',
    description: 'Images à partir de texte avec Stable Diffusion. Haute qualité, 1024×1024. Gratuit.',
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


