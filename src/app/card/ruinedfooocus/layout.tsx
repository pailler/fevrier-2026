import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fooocus : génération d\'images IA simple – Style SD + Midjourney | IA Home',
  description: 'Générez des images IA facilement avec RuinedFooocus. Interface simple, qualité SD/Midjourney. CPU, NVIDIA, macOS. Gratuit et rapide.',
  keywords: [
    'RuinedFooocus',
    'Fooocus',
    'génération image simple',
    'alternative Midjourney gratuit',
    'créer image IA facile',
    'génération images IA',
    'créer images IA',
    'génération images simple',
    'Stable Diffusion Midjourney',
    'générer images avec IA',
    'génération images haute qualité',
    'RuinedFooocus français',
    'Fooocus en ligne',
    'générer images gratuit',
    'génération images précise',
    'créer visuels IA',
    'génération images artistiques',
    'générer images photoréalistes',
    'génération images marketing'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/ruinedfooocus',
  },
  openGraph: {
    title: 'Fooocus : génération d\'images IA simple – Style SD + Midjourney | IA Home',
    description: 'Images IA avec RuinedFooocus. Interface simple, qualité SD/Midjourney. CPU, NVIDIA, macOS. Gratuit.',
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
    title: 'Fooocus : génération d\'images IA simple – Style SD + Midjourney | IA Home',
    description: 'Images IA avec RuinedFooocus. Qualité SD/Midjourney. Gratuit et rapide.',
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


