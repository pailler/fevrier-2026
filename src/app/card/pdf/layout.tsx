import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IA pour PDF : analyser, résumer et interroger vos documents facilement | IA Home',
  description: 'Analysez vos PDF avec une IA : résumés automatiques, questions-réponses, compréhension rapide de documents longs. Testez l\'outil PDF IA de IA Home.',
  keywords: [
    'IA pour PDF',
    'analyser un PDF avec une IA',
    'résumer un PDF automatiquement',
    'poser des questions à un PDF',
    'IA lecture PDF',
    'IA pour documents PDF',
    'chatbot PDF',
    'outil IA PDF en ligne',
    'IA PDF français',
    'comment analyser un PDF avec une IA',
    'quelle IA pour comprendre un document PDF',
    'IA pour résumer un PDF long',
    'IA pour PDF en français gratuit',
    'alternative à ChatGPT pour PDF',
    'PDF IA',
    'intelligence artificielle PDF'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/pdf',
  },
  openGraph: {
    title: 'IA pour PDF : analyser, résumer et interroger vos documents facilement | IA Home',
    description: 'Analysez vos PDF avec une IA : résumés automatiques, questions-réponses, compréhension rapide de documents longs. Testez l\'outil PDF IA de IA Home.',
    url: 'https://iahome.fr/card/pdf',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/pdf-module.jpg',
        width: 1200,
        height: 630,
        alt: 'IA pour PDF - Analyser et comprendre vos documents avec l\'intelligence artificielle',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'IA pour PDF : analyser, résumer et interroger vos documents facilement | IA Home',
    description: 'Analysez vos PDF avec une IA : résumés automatiques, questions-réponses, compréhension rapide de documents longs.',
    images: ['https://iahome.fr/images/pdf-module.jpg'],
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

export default function PDFLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


