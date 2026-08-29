import type { Metadata } from 'next'
import './globals.css'
import { TokenProvider } from '../contexts/TokenContext'
import ConditionalHeader from '../components/ConditionalHeader'
import ConditionalFooter from '../components/ConditionalFooter'
import ConditionalComponents from '../components/ConditionalComponents'
import ClientOnly from '../components/ClientOnly'
import ScrollToTop from '../components/ScrollToTop'
import ClientRedirectHandler from '../components/ClientRedirectHandler'
import Analytics from '../components/Analytics'
import { JsonLd } from '../components/JsonLd'
import { getDefaultJsonLdGraph } from '../utils/structuredData'
import { ECOSYSTEM_SEO } from '../data/ecosystemValueProposition'

export const metadata: Metadata = {
  title: ECOSYSTEM_SEO.defaultTitle,
  description: ECOSYSTEM_SEO.defaultDescription,
  applicationName: 'IA Home',
  authors: [{ name: 'IA Home', url: 'https://iahome.fr' }],
  keywords: [
    'écosystème IA France',
    'intelligence artificielle',
    'outils IA en ligne',
    'IA française',
    'transcription audio IA',
    'Whisper français',
    'génération images IA',
    'Stable Diffusion en ligne',
    'PDF intelligence artificielle',
    'Home Assistant',
    'domotique France',
    'QR codes dynamiques',
    'ComfyUI',
    'formation IA',
    'crédits IA',
    'RGPD',
    'iahome.fr',
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
    'services iahome',
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
    title: ECOSYSTEM_SEO.defaultTitle,
    description: ECOSYSTEM_SEO.defaultDescription,
    url: 'https://iahome.fr',
    siteName: 'IA Home',
    locale: 'fr_FR',
    countryName: 'France',
    images: [
      {
        url: 'https://iahome.fr/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IA Home - Ecosystème d\'Intelligence Artificielle - Formation et Outils IA',
        type: 'image/jpeg',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iahome_fr',
    creator: '@iahome_fr',
    title: ECOSYSTEM_SEO.defaultTitle,
    description: ECOSYSTEM_SEO.defaultDescription,
    images: ['https://iahome.fr/images/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="font-system" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
        {/* Empêcher la mise en cache pour le Header - Version agressive */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate, max-age=0" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta name="cache-control" content="no-cache, no-store, must-revalidate" />
        <meta name="expires" content="0" />
        <meta name="pragma" content="no-cache" />
        {/* Google Search Console Verification */}
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        )}
        <JsonLd data={getDefaultJsonLdGraph()} />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" suppressHydrationWarning>
        <Analytics />
        <TokenProvider>
          <ClientRedirectHandler />
          <ConditionalHeader />
          <main className="flex-1">
            {children}
          </main>
          <ConditionalFooter />
          <ClientOnly>
            <ConditionalComponents />
            <ScrollToTop />
          </ClientOnly>
        </TokenProvider>
      </body>
    </html>
  )
}