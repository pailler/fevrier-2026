import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PsiTransfer : transfert de fichiers sécurisé et privé sans inscription | IA Home',
  description: 'Partagez vos fichiers de manière sécurisée et privée avec PsiTransfer. Transfert de fichiers open-source, sans inscription, avec chiffrement. Alternative privée à WeTransfer et Dropbox.',
  keywords: [
    'transfert de fichiers',
    'partage de fichiers',
    'transfert fichier sécurisé',
    'partage fichier privé',
    'transfert fichier sans inscription',
    'PsiTransfer',
    'alternative WeTransfer',
    'alternative Dropbox',
    'transfert fichier open source',
    'partage fichier chiffré',
    'transfert fichier gratuit',
    'transfert fichier sécurisé français',
    'partage fichier temporaire',
    'transfert fichier volumineux',
    'partage fichier RGPD',
    'transfert fichier privé',
    'partage fichier sans compte',
    'transfert fichier rapide',
    'partage fichier sécurisé',
    'transfert fichier chiffré'
  ],
  alternates: {
    canonical: 'https://iahome.fr/card/psitransfer',
  },
  openGraph: {
    title: 'PsiTransfer : transfert de fichiers sécurisé et privé sans inscription | IA Home',
    description: 'Partagez vos fichiers de manière sécurisée et privée avec PsiTransfer. Transfert de fichiers open-source, sans inscription, avec chiffrement.',
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
    title: 'PsiTransfer : transfert de fichiers sécurisé et privé sans inscription | IA Home',
    description: 'Partagez vos fichiers de manière sécurisée et privée avec PsiTransfer. Transfert de fichiers open-source, sans inscription.',
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


