import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Générateur QR code dynamique – Modifiable et suivi | IA Home',
  description: 'Créez des QR codes modifiables avec analytics. Changez l\'URL sans refaire le code. Suivi des scans, personnalisation. Générateur QR code pro.',
  keywords: [
    'générateur QR code',
    'QR code dynamique',
    'créer QR code',
    'QR code modifiable',
    'QR code analytics',
    'QR code modifiable URL',
    'générateur QR code gratuit',
    'QR code avec analytics',
    'QR code personnalisé',
    'QR code professionnel',
    'QR code tracking',
    'QR code marketing',
    'QR code avec logo',
    'QR code couleur',
    'générateur QR code en ligne',
    'QR code événement',
    'QR code restaurant',
    'QR code campagne marketing',
    'QR code dynamique français'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/qrcodes',
  },
  openGraph: {
    title: 'Générateur QR code dynamique – Modifiable et suivi | IA Home',
    description: 'QR codes modifiables avec analytics. Changez l\'URL sans refaire le code. Suivi des scans. Générateur pro.',
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
    title: 'Générateur QR code dynamique – Modifiable et suivi | IA Home',
    description: 'QR codes modifiables avec analytics. Changez l\'URL sans refaire le code. Suivi des scans.',
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


