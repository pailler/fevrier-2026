import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Résumer et interroger un PDF avec l\'IA | IA Home',
  description: 'Résumez vos PDF et posez des questions à vos documents. Résumés automatiques, Q/R sur le contenu. Outil PDF IA gratuit en français.',
  keywords: [
    'IA pour PDF',
    'résumer un PDF',
    'résumer PDF gratuit',
    'poser des questions à un PDF',
    'IA lire PDF',
    'question réponse PDF',
    'résumé automatique PDF',
    'analyser un PDF avec une IA',
    'chatbot PDF',
    'outil IA PDF en ligne',
    'IA PDF français',
    'alternative à ChatGPT pour PDF',
    'PDF IA',
    'intelligence artificielle PDF',
    'comprendre un document PDF'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/pdf',
  },
  openGraph: {
    title: 'Résumer et interroger un PDF avec l\'IA | IA Home',
    description: 'Résumez vos PDF et posez des questions à vos documents. Résumés automatiques, Q/R. Outil PDF IA gratuit en français.',
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
    title: 'Résumer et interroger un PDF avec l\'IA | IA Home',
    description: 'Résumez vos PDF, posez des questions. Résumés automatiques, Q/R. Outil PDF IA gratuit.',
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


