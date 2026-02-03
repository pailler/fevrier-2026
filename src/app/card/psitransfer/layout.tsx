import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Envoyer des fichiers volumineux – Transfert sécurisé sans compte | IA Home',
  description: 'Envoyez des fichiers en toute confidentialité avec PsiTransfer. Sans inscription, chiffré, open source. Alternative WeTransfer et Dropbox.',
  keywords: [
    'envoyer gros fichier',
    'transfert fichier gratuit',
    'partage fichier sécurisé',
    'WeTransfer gratuit',
    'transfert de fichiers',
    'partage de fichiers',
    'PsiTransfer',
    'alternative WeTransfer',
    'alternative Dropbox',
    'transfert fichier sécurisé',
    'transfert fichier sans inscription',
    'transfert fichier open source',
    'partage fichier chiffré',
    'transfert fichier volumineux',
    'partage fichier RGPD',
    'transfert fichier privé',
    'partage fichier sans compte',
    'transfert fichier rapide',
    'transfert fichier chiffré',
    'transfert fichier sécurisé français'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/psitransfer',
  },
  openGraph: {
    title: 'Envoyer des fichiers volumineux – Transfert sécurisé sans compte | IA Home',
    description: 'Envoyez des fichiers en toute confidentialité avec PsiTransfer. Sans inscription, chiffré, open source. Alternative WeTransfer.',
    url: 'https://iahome.fr/card/psitransfer',
    siteName: 'IA Home',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://iahome.fr/images/psitransfer-module.jpg',
        width: 1200,
        height: 630,
        alt: 'PsiTransfer - Transfert de fichiers sécurisé et privé sans inscription',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'Envoyer des fichiers volumineux – Transfert sécurisé sans compte | IA Home',
    description: 'Envoyez des fichiers avec PsiTransfer. Sans inscription, chiffré, open source. Alternative WeTransfer.',
    images: ['https://iahome.fr/images/psitransfer-module.jpg'],
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

export default function PsiTransferLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


