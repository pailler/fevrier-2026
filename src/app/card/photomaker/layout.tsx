import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portraits personnalisés par IA – PhotoMaker | IA Home',
  description: 'Créez des portraits réalistes à partir d\'une photo. PhotoMaker : fidélité au visage, pas de LoRA. Pour créateurs, photographes et réseaux sociaux.',
  keywords: [
    'PhotoMaker',
    'portrait IA personnalisé',
    'avatar à partir photo',
    'photo réaliste IA',
    'personnalisation photos IA',
    'créer portraits personnalisés',
    'générer portraits IA',
    'personnalisation photos par IA',
    'générer portraits photoréalistes',
    'créer avatars personnalisés',
    'IA personnalisation photos',
    'PhotoMaker français',
    'PhotoMaker en ligne',
    'générer portraits gratuit',
    'portrait à partir selfie',
    'créer portraits avec IA',
    'personnalisation photos haute qualité',
    'personnalisation photos marketing',
    'créer visuels IA'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/photomaker',
  },
  openGraph: {
    title: 'Portraits personnalisés par IA – PhotoMaker | IA Home',
    description: 'Portraits réalistes à partir d\'une photo. PhotoMaker : fidélité au visage, pas de LoRA. Créateurs, photographes.',
    url: 'https://iahome.fr/card/photomaker',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/photomaker.jpg',
        width: 1200,
        height: 630,
        alt: 'PhotoMaker - Personnalisation de photos réalistes par IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Portraits personnalisés par IA – PhotoMaker | IA Home',
    description: 'Portraits réalistes à partir d\'une photo. Fidélité au visage, pas de LoRA. Gratuit.',
    images: ['https://iahome.fr/images/photomaker.jpg'],
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

export default function PhotoMakerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
