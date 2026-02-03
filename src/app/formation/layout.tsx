import type { Metadata } from 'next'

const baseUrl = 'https://iahome.fr'

export const metadata: Metadata = {
  title: 'Formation IA – Cours et tutoriels intelligence artificielle | IAHome',
  description: 'Formations et cours sur l\'intelligence artificielle : débutant, intermédiaire, avancé. Apprenez l\'IA à votre rythme avec IAHome – tutoriels, exercices et parcours structurés.',
  keywords: [
    'formation IA',
    'cours intelligence artificielle',
    'tutoriel IA',
    'apprendre l\'IA',
    'formation intelligence artificielle',
    'cours IA débutant',
    'formation IA en ligne',
    'IAHome formation',
    'parcours IA',
  ],
  alternates: {
    canonical: `${baseUrl}/formation`,
  },
  openGraph: {
    title: 'Formation IA – Cours et tutoriels intelligence artificielle | IAHome',
    description: 'Formations et cours sur l\'intelligence artificielle : débutant à avancé. Apprenez l\'IA à votre rythme avec IAHome.',
    url: `${baseUrl}/formation`,
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formation IA – Cours et tutoriels IA | IAHome',
    description: 'Formations et cours sur l\'intelligence artificielle. Apprenez l\'IA à votre rythme avec IAHome.',
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
  '@type': 'CollectionPage',
  name: 'Formation IA – IAHome',
  description: 'Formations et cours sur l\'intelligence artificielle : débutant, intermédiaire, avancé. Parcours structurés et tutoriels.',
  url: `${baseUrl}/formation`,
  publisher: {
    '@type': 'Organization',
    name: 'IA Home',
    url: baseUrl,
  },
  mainEntity: {
    '@type': 'ItemList',
    name: 'Catalogue des formations IA',
    description: 'Liste des formations et cours d\'intelligence artificielle disponibles sur IAHome.',
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
  },
  inLanguage: 'fr-FR',
}

export default function FormationLayout({
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
