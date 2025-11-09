import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TokenProvider } from '../contexts/TokenContext'
import ClientHeader from '../components/ClientHeader'
import Footer from '../components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IA Home - Plateforme d\'Intelligence Artificielle | Formation IA & Outils IA',
  description: 'Découvrez l\'IA avec IA Home : formations interactives, outils Whisper, Stable Diffusion, ComfyUI. Accédez à nos services via whisper.iahome.fr, librespeed.iahome.fr, qrcodes.iahome.fr et tous nos sous-domaines. Apprenez l\'intelligence artificielle à votre rythme avec nos modules pratiques et nos cours adaptés à tous les niveaux.',
  applicationName: 'IA Home',
  authors: [{ name: 'IA Home', url: 'https://iahome.fr' }],
  keywords: [
    'intelligence artificielle',
    'IA',
    'formation IA',
    'Whisper',
    'Stable Diffusion',
    'ComfyUI',
    'apprentissage IA',
    'tutoriel IA',
    'outils IA',
    'plateforme IA',
    'cours IA',
    'formation intelligence artificielle',
    'développement IA',
    'machine learning',
    'deep learning',
    'IA française',
    'whisper.iahome.fr',
    'librespeed.iahome.fr',
    'qrcodes.iahome.fr',
    'metube.iahome.fr',
    'pdf.iahome.fr',
    'psitransfer.iahome.fr',
    'meeting-reports.iahome.fr',
    'stablediffusion.iahome.fr',
    'comfyui.iahome.fr',
    'sous-domaines iahome',
    'services iahome'
  ],
  creator: 'IA Home',
  publisher: 'IA Home',
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
  category: 'Technology',
  classification: 'Intelligence Artificielle',
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IA Home',
  },
  alternates: {
    canonical: 'https://iahome.fr',
    languages: {
      'fr-FR': 'https://iahome.fr',
    },
  },
  openGraph: {
    title: 'IA Home - Plateforme d\'Intelligence Artificielle | Formation IA & Outils IA',
    description: 'Découvrez l\'IA avec IA Home : formations interactives, outils Whisper, Stable Diffusion, ComfyUI. Apprenez l\'intelligence artificielle à votre rythme.',
    url: 'https://iahome.fr',
    siteName: 'IA Home',
    locale: 'fr_FR',
    countryName: 'France',
    images: [
      {
        url: 'https://iahome.fr/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IA Home - Plateforme d\'Intelligence Artificielle - Formation et Outils IA',
        type: 'image/jpeg',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: 'IA Home - Plateforme d\'Intelligence Artificielle | Formation IA & Outils IA',
    description: 'Découvrez l\'IA avec IA Home : formations interactives, outils Whisper, Stable Diffusion, ComfyUI. Apprenez l\'intelligence artificielle à votre rythme.',
    images: ['https://iahome.fr/images/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="font-system">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Redirection automatique pour qrcodes.iahome.fr
            if (window.location.hostname === 'qrcodes.iahome.fr') {
              window.location.href = '/qrcodes';
            }
          `
        }} />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <TokenProvider>
          <ClientHeader />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </TokenProvider>
      </body>
    </html>
  )
}