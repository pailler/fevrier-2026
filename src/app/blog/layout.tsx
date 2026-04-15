import type { Metadata } from 'next'

const baseUrl = 'https://iahome.fr'

export const metadata: Metadata = {
  title: 'Blog IA — guides, tutoriels et actualités | IAHome',
  description:
    'Articles et guides sur l’intelligence artificielle : outils (transcription, images, PDF), baromètres, usages concrets et SEO. Ressources IA en français par IAHome.',
  keywords: [
    'blog IA',
    'articles intelligence artificielle',
    'guides IA',
    'tutoriel Whisper',
    'tutoriel Stable Diffusion',
    'actualités IA',
    'outils IA',
    'plateforme IA France',
    'ressources IA',
    'baromètres IA',
    'applications IA',
    'IAHome blog',
    'formation IA',
    'référencement IA',
  ],
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
  openGraph: {
    title: 'Blog IA — guides, tutoriels et actualités | IAHome',
    description:
      'Guides et articles sur l’IA : outils, usages et actualité. Blog IAHome en français.',
    url: `${baseUrl}/blog`,
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog IA — guides et actualités | IAHome',
    description: 'Guides, tutoriels et veille sur l’intelligence artificielle. Blog IAHome.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Blog IAHome',
  description: 'Articles sur l\'intelligence artificielle : outils IA, baromètres, applications, bonnes pratiques.',
  url: `${baseUrl}/blog`,
  publisher: {
    '@type': 'Organization',
    name: 'IA Home',
    url: baseUrl,
  },
  inLanguage: 'fr-FR',
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
