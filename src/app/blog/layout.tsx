import type { Metadata } from 'next'

const baseUrl = 'https://iahome.fr'

export const metadata: Metadata = {
  title: 'Blog IA – Articles et actualités IA | IAHome',
  description: 'Articles sur l\'intelligence artificielle : outils IA, baromètres, applications, bonnes pratiques. Blog IAHome – ressources et actualités IA en français.',
  keywords: [
    'blog IA',
    'articles intelligence artificielle',
    'actualités IA',
    'outils IA',
    'ressources IA',
    'baromètres IA',
    'applications IA',
    'IAHome blog',
    'formation IA',
  ],
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
  openGraph: {
    title: 'Blog IA – Articles et actualités IA | IAHome',
    description: 'Articles sur l\'intelligence artificielle : outils IA, baromètres, applications, bonnes pratiques. Blog IAHome.',
    url: `${baseUrl}/blog`,
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog IA – Articles et actualités IA | IAHome',
    description: 'Articles sur l\'intelligence artificielle : outils IA, baromètres, applications. Blog IAHome.',
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
