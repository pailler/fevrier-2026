import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QR Codes Dynamiques : générateur de QR codes modifiables avec analytics | IA Home',
  description: 'Créez des QR codes dynamiques modifiables avec suivi en temps réel, personnalisation avancée et analytics détaillés. Modifiez l\'URL sans recréer le code. Générateur de QR codes professionnel avec analytics.',
  keywords: [
    'QR code dynamique',
    'générateur QR code',
    'QR code modifiable',
    'créer QR code',
    'QR code avec analytics',
    'QR code personnalisé',
    'QR code professionnel',
    'générateur QR code gratuit',
    'QR code marketing',
    'QR code tracking',
    'QR code analytics',
    'QR code modifiable URL',
    'QR code dynamique français',
    'créer QR code personnalisé',
    'QR code avec logo',
    'QR code couleur',
    'QR code campagne marketing',
    'générateur QR code en ligne',
    'QR code événement',
    'QR code restaurant'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/qrcodes',
  },
  openGraph: {
    title: 'QR Codes Dynamiques : générateur de QR codes modifiables avec analytics | IA Home',
    description: 'Créez des QR codes dynamiques modifiables avec suivi en temps réel, personnalisation avancée et analytics détaillés. Modifiez l\'URL sans recréer le code.',
    url: 'https://iahome.fr/card/qrcodes',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/qrcodes.jpg',
        width: 1200,
        height: 630,
        alt: 'QR Codes Dynamiques - Générateur de QR codes modifiables avec analytics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'QR Codes Dynamiques : générateur de QR codes modifiables avec analytics | IA Home',
    description: 'Créez des QR codes dynamiques modifiables avec suivi en temps réel, personnalisation avancée et analytics détaillés.',
    images: ['https://iahome.fr/images/qrcodes.jpg'],
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

export default function QRCodesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


