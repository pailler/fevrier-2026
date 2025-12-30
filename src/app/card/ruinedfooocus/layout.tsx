import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RuinedFooocus : génération d\'images IA simple et précise | IA Home',
  description: 'Créez des images de haute qualité avec RuinedFooocus. Combinaison des meilleurs aspects de Stable Diffusion et Midjourney. Génération d\'images par IA simple, précise et rapide. Support CPU, NVIDIA, DirectML, ROCm, macOS. Parfait pour artistes, designers et créateurs de contenu.',
  keywords: [
    'RuinedFooocus',
    'génération images IA',
    'créer images IA',
    'Fooocus',
    'génération images simple',
    'génération images précise',
    'Stable Diffusion Midjourney',
    'générer images avec IA',
    'IA génération images',
    'créer images avec IA',
    'génération images haute qualité',
    'RuinedFooocus français',
    'générer images professionnelles',
    'créer visuels IA',
    'génération images artistiques',
    'IA création images',
    'générer images photoréalistes',
    'créer illustrations IA',
    'génération images marketing',
    'Fooocus en ligne'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/ruinedfooocus',
  },
  openGraph: {
    title: 'RuinedFooocus : génération d\'images IA simple et précise | IA Home',
    description: 'Créez des images de haute qualité avec RuinedFooocus. Combinaison des meilleurs aspects de Stable Diffusion et Midjourney. Génération d\'images par IA simple, précise et rapide.',
    url: 'https://iahome.fr/card/ruinedfooocus',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/ruinedfooocus.jpg',
        width: 1200,
        height: 630,
        alt: 'RuinedFooocus - Génération d\'images IA simple et précise',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'RuinedFooocus : génération d\'images IA simple et précise | IA Home',
    description: 'Créez des images de haute qualité avec RuinedFooocus. Combinaison des meilleurs aspects de Stable Diffusion et Midjourney.',
    images: ['https://iahome.fr/images/ruinedfooocus.jpg'],
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

export default function RuinedFooocusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


