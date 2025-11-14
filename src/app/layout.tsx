import type { Metadata } from 'next'
import './globals.css'
import { TokenProvider } from '../contexts/TokenContext'
import ClientHeader from '../components/ClientHeader'
import Footer from '../components/Footer'
import ConditionalComponents from '../components/ConditionalComponents'
import ClientOnly from '../components/ClientOnly'

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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb',
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
            
            // Gestionnaire d'erreur global pour les erreurs webpack
            (function() {
              window.addEventListener('error', function(event) {
                const error = event.error || event.message || '';
                const isWebpackError = 
                  (typeof error === 'string' && (
                    error.includes("can't access property") ||
                    error.includes("e[o] is undefined") ||
                    error.includes("ChunkLoadError") ||
                    error.includes("Loading chunk")
                  )) ||
                  (error && error.message && (
                    error.message.includes("can't access property") ||
                    error.message.includes("e[o] is undefined") ||
                    error.message.includes("ChunkLoadError") ||
                    error.message.includes("Loading chunk")
                  ));
                
                if (isWebpackError) {
                  console.warn('⚠️ Erreur Webpack détectée:', error);
                  console.warn('💡 Tentative de rechargement automatique dans 2 secondes...');
                  
                  // Vider le cache et recharger
                  setTimeout(function() {
                    if ('caches' in window) {
                      caches.keys().then(function(names) {
                        names.forEach(function(name) {
                          caches.delete(name);
                        });
                        window.location.reload();
                      });
                    } else {
                      window.location.reload();
                    }
                  }, 2000);
                }
              }, true);
              
              // Intercepter les erreurs non capturées
              window.addEventListener('unhandledrejection', function(event) {
                const error = event.reason || '';
                const isWebpackError = 
                  (typeof error === 'string' && (
                    error.includes("can't access property") ||
                    error.includes("e[o] is undefined") ||
                    error.includes("ChunkLoadError")
                  )) ||
                  (error && error.message && (
                    error.message.includes("can't access property") ||
                    error.message.includes("e[o] is undefined") ||
                    error.message.includes("ChunkLoadError")
                  ));
                
                if (isWebpackError) {
                  console.warn('⚠️ Erreur Webpack (promise rejection) détectée:', error);
                  event.preventDefault();
                  setTimeout(function() {
                    window.location.reload();
                  }, 2000);
                }
              });
            })();
            
            // Bloquer les requêtes vers radar.cloudflare.com pour éviter les erreurs CORS
            (function() {
              const originalFetch = window.fetch;
              window.fetch = function(...args) {
                const url = args[0];
                if (typeof url === 'string' && url.includes('radar.cloudflare.com')) {
                  console.warn('Requête vers radar.cloudflare.com bloquée pour éviter les erreurs CORS');
                  return Promise.reject(new Error('Blocked: radar.cloudflare.com'));
                }
                return originalFetch.apply(this, args);
              };
              
              const originalXHROpen = XMLHttpRequest.prototype.open;
              XMLHttpRequest.prototype.open = function(method, url, ...rest) {
                if (typeof url === 'string' && url.includes('radar.cloudflare.com')) {
                  console.warn('Requête XHR vers radar.cloudflare.com bloquée pour éviter les erreurs CORS');
                  return;
                }
                return originalXHROpen.apply(this, [method, url, ...rest]);
              };
            })();
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
          <ClientOnly>
            <ConditionalComponents />
          </ClientOnly>
        </TokenProvider>
      </body>
    </html>
  )
}