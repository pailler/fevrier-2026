import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image vers 3D – Génération de modèles 3D par IA | IA Home',
  description: 'Transformez une image en modèle 3D avec Hunyuan 3D (Tencent). Export OBJ/glTF, textures. Idéal impression 3D, jeux et visuels.',
  keywords: [
    'image vers 3D',
    'image to 3D',
    'photo to 3D',
    'génération 3D IA',
    'modèle 3D à partir image',
    'single image 3D',
    'Hunyuan 3D',
    'génération 3D',
    'créer modèle 3D',
    'IA 3D',
    'créer objet 3D',
    'modélisation 3D IA',
    'reconstruction 3D',
    'génération 3D gratuit',
    'génération 3D Tencent',
    'export 3D',
    'impression 3D',
    'modèle 3D haute qualité',
    'génération 3D professionnel',
    'génération 3D français'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/hunyuan3d',
  },
  openGraph: {
    title: 'Image vers 3D – Génération de modèles 3D par IA | IA Home',
    description: 'Transformez une image en modèle 3D avec Hunyuan 3D (Tencent). Export OBJ/glTF, textures. Impression 3D, jeux.',
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
    title: 'Image vers 3D – Génération de modèles 3D par IA | IA Home',
    description: 'Image en modèle 3D avec Hunyuan 3D (Tencent). Export OBJ/glTF. Impression 3D, jeux.',
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


