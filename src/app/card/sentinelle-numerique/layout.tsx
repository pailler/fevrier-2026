import type { Metadata } from 'next'
import { CardPageJsonLd } from '@/components/CardPageJsonLd'

export const metadata: Metadata = {
  title: 'Sentinelle Numérique – Vigilance et détection de contenu IA | IA Home',
  description: 'Sentinelle Numérique : analysez vos documents et images pour détecter la proportion de contenu généré par l\'IA. Vigilance numérique et détection précise.',
  keywords: [
    'Sentinelle Numérique',
    'détection contenu IA',
    'vigilance numérique',
    'analyse documents IA',
    'détecter contenu généré IA',
    'authenticité numérique',
    'détection ChatGPT',
    'détection IA textes',
    'Sentinelle Numérique français'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/sentinelle-numerique',
  },
  openGraph: {
    title: 'Sentinelle Numérique – Vigilance et détection de contenu IA | IA Home',
    description: 'Analysez vos documents et images pour détecter le contenu généré par l\'IA. Vigilance numérique et détection précise.',
    url: 'https://iahome.fr/card/sentinelle-numerique',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/sentinelle-numerique.jpg',
        width: 1200,
        height: 630,
        alt: 'Sentinelle Numérique - Vigilance et détection de contenu IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Sentinelle Numérique – Vigilance et détection de contenu IA | IA Home',
    description: 'Analysez documents et images pour détecter le contenu généré par l\'IA.',
    images: ['https://iahome.fr/images/sentinelle-numerique.jpg'],
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

export default function SentinelleNumeriqueLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CardPageJsonLd slug="sentinelle-numerique" />
      {children}
    </>
  )
}
