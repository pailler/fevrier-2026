import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ComfyUI : workflows IA et génération d\'images par nœuds | IA Home',
  description: 'Créez des pipelines IA avec ComfyUI. Interface à nœuds pour Stable Diffusion, contrôle avancé, workflows réutilisables. ComfyUI en ligne.',
  keywords: [
    'ComfyUI',
    'ComfyUI workflow',
    'workflow stable diffusion',
    'workflow IA',
    'noeuds IA',
    'interface graphique IA',
    'nodes stable diffusion',
    'pipeline IA images',
    'ComfyUI nodes',
    'créer workflow IA',
    'système de nœuds IA',
    'génération images IA',
    'workflow modulaire IA',
    'ComfyUI français',
    'workflow IA avancé',
    'créer pipeline IA',
    'automatisation IA',
    'génération images workflow',
    'ComfyUI en ligne'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/comfyui',
  },
  openGraph: {
    title: 'ComfyUI : workflows IA et génération d\'images par nœuds | IA Home',
    description: 'Pipelines IA avec ComfyUI. Interface à nœuds pour Stable Diffusion, workflows réutilisables. ComfyUI en ligne.',
    url: 'https://iahome.fr/card/comfyui',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/comfyui.jpg',
        width: 1200,
        height: 630,
        alt: 'ComfyUI - Interface graphique avancée pour créer des workflows IA complexes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'ComfyUI : workflows IA et génération d\'images par nœuds | IA Home',
    description: 'Pipelines IA avec ComfyUI. Nœuds pour Stable Diffusion, workflows réutilisables.',
    images: ['https://iahome.fr/images/comfyui.jpg'],
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

export default function ComfyUILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


