import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PhotoMaker : personnalisation de photos réalistes par IA | IA Home',
  description: 'Créez des portraits personnalisés en quelques secondes avec PhotoMaker. Personnalisation rapide sans entraînement LoRA, fidélité d\'identité impressionnante, diversité et contrôle textuel. Parfait pour photographes, créateurs de contenu et professionnels du marketing.',
  keywords: [
    'PhotoMaker',
    'personnalisation photos IA',
    'créer portraits personnalisés',
    'personnalisation photos par IA',
    'stacked id embedding',
    'générer portraits IA',
    'IA personnalisation photos',
    'créer portraits avec IA',
    'personnalisation photos haute qualité',
    'PhotoMaker français',
    'générer portraits personnalisés',
    'créer visuels IA',
    'personnalisation photos artistiques',
    'IA création portraits',
    'générer portraits photoréalistes',
    'créer avatars personnalisés',
    'personnalisation photos marketing',
    'PhotoMaker en ligne',
    'générer portraits gratuit',
    'créer portraits personnalisés'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/photomaker',
  },
  openGraph: {
    title: 'PhotoMaker : personnalisation de photos réalistes par IA | IA Home',
    description: 'Créez des portraits personnalisés en quelques secondes avec PhotoMaker. Personnalisation rapide sans entraînement LoRA, fidélité d\'identité impressionnante.',
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
    title: 'PhotoMaker : personnalisation de photos réalistes par IA | IA Home',
    description: 'Créez des portraits personnalisés en quelques secondes avec PhotoMaker. Personnalisation rapide sans entraînement LoRA.',
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
