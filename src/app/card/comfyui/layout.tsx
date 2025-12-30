import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ComfyUI : interface graphique avancée pour créer des workflows IA complexes | IA Home',
  description: 'Créez des workflows d\'intelligence artificielle complexes avec ComfyUI. Interface graphique intuitive avec système de nœuds modulaires, workflows réutilisables, contrôle granulaire. Parfait pour artistes, développeurs et professionnels du marketing.',
  keywords: [
    'ComfyUI',
    'interface graphique IA',
    'workflow IA',
    'créer workflow IA',
    'système de nœuds IA',
    'génération images IA',
    'workflow modulaire IA',
    'interface graphique intelligence artificielle',
    'ComfyUI workflow',
    'créer workflows IA complexes',
    'nœuds IA modulaires',
    'automatisation IA',
    'pipeline IA',
    'génération images avec IA',
    'workflow IA personnalisé',
    'interface graphique pour IA',
    'ComfyUI français',
    'workflow IA avancé',
    'créer pipeline IA',
    'génération images workflow'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/comfyui',
  },
  openGraph: {
    title: 'ComfyUI : interface graphique avancée pour créer des workflows IA complexes | IA Home',
    description: 'Créez des workflows d\'intelligence artificielle complexes avec ComfyUI. Interface graphique intuitive avec système de nœuds modulaires, workflows réutilisables, contrôle granulaire.',
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
    title: 'ComfyUI : interface graphique avancée pour créer des workflows IA complexes | IA Home',
    description: 'Créez des workflows d\'intelligence artificielle complexes avec ComfyUI. Interface graphique intuitive avec système de nœuds modulaires.',
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


