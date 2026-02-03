import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Démarches administratives France : CAF, impôts, permis | IA Home',
  description: 'Accès direct aux sites officiels : CAF, impôts, Sécurité sociale, permis, retraite, scolarité. Portail des démarches administratives françaises en ligne.',
  keywords: [
    'démarches administratives',
    'services administration',
    'CAF',
    'Sécurité Sociale',
    'permis de conduire',
    'impôts',
    'aides sociales',
    'démarches en ligne',
    'administration française',
    'service-public.fr',
    'impots.gouv',
    'caf.fr',
    'ameli',
    'portail démarches',
    'accès démarches administratives',
    'CAF en ligne',
    'Sécurité Sociale en ligne',
    'impôts en ligne',
    'retraite',
    'chômage',
    'scolarité'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/administration',
  },
  openGraph: {
    title: 'Démarches administratives France : CAF, impôts, permis | IA Home',
    description: 'Accès direct aux sites officiels : CAF, impôts, Sécurité sociale, permis, retraite, scolarité. Portail des démarches en ligne.',
    url: 'https://iahome.fr/card/administration',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/administration.jpg',
        width: 1200,
        height: 630,
        alt: 'Démarches administratives France - CAF, impôts, permis, portail en ligne',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Démarches administratives France : CAF, impôts, permis | IA Home',
    description: 'Accès direct CAF, impôts, Sécurité sociale, permis, retraite, scolarité. Portail démarches en ligne.',
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


