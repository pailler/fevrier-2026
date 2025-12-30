import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services de l\'Administration : accès rapide aux démarches administratives françaises | IA Home',
  description: 'Portail centralisé pour accéder rapidement aux principaux services de l\'administration française : CAF, Sécurité Sociale, permis de conduire, aides sociales, scolarité, études, retraites, famille, handicap, impôts. Accès simplifié aux démarches en ligne.',
  keywords: [
    'services administration',
    'démarches administratives',
    'CAF',
    'Sécurité Sociale',
    'permis de conduire',
    'aides sociales',
    'démarches en ligne',
    'administration française',
    'services publics',
    'portail administration',
    'accès démarches administratives',
    'liens administration',
    'services administratifs français',
    'CAF en ligne',
    'Sécurité Sociale en ligne',
    'impôts en ligne',
    'papiers identité',
    'retraite',
    'chômage',
    'scolarité'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/administration',
  },
  openGraph: {
    title: 'Services de l\'Administration : accès rapide aux démarches administratives françaises | IA Home',
    description: 'Portail centralisé pour accéder rapidement aux principaux services de l\'administration française : CAF, Sécurité Sociale, permis de conduire, aides sociales, scolarité, études, retraites, famille, handicap, impôts.',
    url: 'https://iahome.fr/card/administration',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/administration.jpg',
        width: 1200,
        height: 630,
        alt: 'Services de l\'Administration - Accès rapide aux démarches administratives françaises',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Services de l\'Administration : accès rapide aux démarches administratives françaises | IA Home',
    description: 'Portail centralisé pour accéder rapidement aux principaux services de l\'administration française.',
    images: ['https://iahome.fr/images/administration.jpg'],
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

export default function AdministrationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


