import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hunyuan 3D : génération de modèles 3D à partir d\'images avec l\'IA | IA Home',
  description: 'Générez des modèles 3D réalistes à partir d\'images avec Hunyuan 3D. Intelligence artificielle pour créer des objets 3D détaillés, textures précises, export multi-formats. Génération 3D par IA de Tencent.',
  keywords: [
    'génération 3D',
    'modèle 3D',
    'créer modèle 3D',
    'image vers 3D',
    'génération 3D IA',
    'IA 3D',
    'Hunyuan 3D',
    'créer objet 3D',
    'modélisation 3D IA',
    'reconstruction 3D',
    'génération 3D gratuit',
    'génération 3D français',
    'créer modèle 3D à partir image',
    'IA génération 3D',
    'modèle 3D IA',
    'génération 3D Tencent',
    'export 3D',
    'impression 3D',
    'modèle 3D haute qualité',
    'génération 3D professionnel'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/hunyuan3d',
  },
  openGraph: {
    title: 'Hunyuan 3D : génération de modèles 3D à partir d\'images avec l\'IA | IA Home',
    description: 'Générez des modèles 3D réalistes à partir d\'images avec Hunyuan 3D. Intelligence artificielle pour créer des objets 3D détaillés, textures précises, export multi-formats.',
    url: 'https://iahome.fr/card/hunyuan3d',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/hunyuan3d.jpg',
        width: 1200,
        height: 630,
        alt: 'Hunyuan 3D - Génération de modèles 3D à partir d\'images avec l\'IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Hunyuan 3D : génération de modèles 3D à partir d\'images avec l\'IA | IA Home',
    description: 'Générez des modèles 3D réalistes à partir d\'images avec Hunyuan 3D. Intelligence artificielle pour créer des objets 3D détaillés.',
    images: ['https://iahome.fr/images/hunyuan3d.jpg'],
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

export default function Hunyuan3DLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


