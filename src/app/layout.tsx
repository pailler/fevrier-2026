import type { Metadata } from 'next'
import './globals.css'
import { TokenProvider } from '../contexts/TokenContext'
import ClientHeader from '../components/ClientHeader'
import Footer from '../components/Footer'
import ConditionalComponents from '../components/ConditionalComponents'
import ClientOnly from '../components/ClientOnly'
import ScrollToTop from '../components/ScrollToTop'

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
    <html lang="fr" className="font-system">
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
        <script dangerouslySetInnerHTML={{
          __html: `
            // VIDAGE DU CACHE AU CHARGEMENT - VERSION AGRESSIVE POUR MOBILE
            (function() {
              // Vérifier que nous sommes côté client
              if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
                return;
              }
              
              const HEADER_VERSION = '4.0.0';
              
              // Vérifier la version du Header stockée AVANT toute opération coûteuse
              const storedHeaderVersion = localStorage.getItem('header_version');
              
              // VIDER LES CACHES UNIQUEMENT si version différente (optimisation performance)
              if (storedHeaderVersion !== HEADER_VERSION) {
                // VIDER TOUS LES CACHES UNIQUEMENT SI NÉCESSAIRE
                if ('caches' in window) {
                  // Exécuter en arrière-plan pour ne pas bloquer
                  setTimeout(function() {
                    caches.keys().then(function(names) {
                      names.forEach(function(name) {
                        caches.delete(name).catch(function() {});
                      });
                    });
                  }, 0);
                }
                
                // Vider le cache du navigateur en arrière-plan
                if ('serviceWorker' in navigator) {
                  setTimeout(function() {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      registrations.forEach(function(registration) {
                        registration.unregister().catch(function() {});
                      });
                    });
                  }, 0);
                }
                // Vider localStorage et sessionStorage des anciennes versions
                const oldKeys = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && (key.includes('header') || key.includes('cache') || key.includes('version') || key.includes('banner'))) {
                    oldKeys.push(key);
                  }
                }
                oldKeys.forEach(function(key) {
                  localStorage.removeItem(key);
                });
                
                // Vider sessionStorage aussi
                if (typeof sessionStorage !== 'undefined') {
                  const sessionOldKeys = [];
                  for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key && (key.includes('header') || key.includes('cache') || key.includes('version') || key.includes('banner'))) {
                      sessionOldKeys.push(key);
                    }
                  }
                  sessionOldKeys.forEach(function(key) {
                    sessionStorage.removeItem(key);
                  });
                }
                
                // Stocker la nouvelle version
                localStorage.setItem('header_version', HEADER_VERSION);
                
                // FORCER le rechargement immédiat avec cache bypass
                const timestamp = Date.now();
                const url = new URL(window.location.href);
                url.searchParams.set('_v', timestamp.toString());
                url.searchParams.set('_h', HEADER_VERSION);
                url.searchParams.set('_cb', '1');
                url.searchParams.set('_force', '1');
                url.searchParams.set('_clear', '1');
                url.searchParams.set('_radical', '1');
                window.location.replace(url.toString());
                return;
              }
              
              // Toujours stocker la version actuelle
              localStorage.setItem('header_version', HEADER_VERSION);
              
              
              // DÉSACTIVÉ : Vérification de version simplifiée pour améliorer les performances
              // La vérification ne se fait que si la version stockée est différente
            })();
            
            // Redirection automatique pour qrcodes.iahome.fr
            if (typeof window !== 'undefined' && window.location && window.location.hostname === 'qrcodes.iahome.fr') {
              window.location.href = '/qrcodes';
            }
            
            // Gestionnaire d'erreur global pour les erreurs webpack
            (function() {
              // Vérifier que nous sommes côté client
              if (typeof window === 'undefined') {
                return;
              }
              
              let reloadCount = 0;
              const MAX_RELOADS = 2; // Limiter à 2 rechargements pour éviter les boucles infinies
              
              window.addEventListener('error', function(event) {
                const error = event.error || event.message || '';
                const errorMessage = (typeof error === 'string' ? error : (error && error.message ? error.message : ''));
                
                // Ignorer les erreurs liées à url.length pour éviter les boucles infinies
                if (errorMessage.includes("can't access property") && errorMessage.includes("url") && errorMessage.includes("undefined")) {
                  console.warn('⚠️ Erreur url.length détectée - Rechargement automatique désactivé pour éviter les boucles');
                  event.preventDefault();
                  return;
                }
                
                const isWebpackError = 
                  (typeof error === 'string' && (
                    error.includes("ChunkLoadError") ||
                    error.includes("Loading chunk")
                  )) ||
                  (error && error.message && (
                    error.message.includes("ChunkLoadError") ||
                    error.message.includes("Loading chunk")
                  ));
                
                if (isWebpackError && reloadCount < MAX_RELOADS) {
                  reloadCount++;
                  // Logs réduits pour améliorer les performances
                  
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
                } else if (isWebpackError) {
                  console.error('❌ Trop de tentatives de rechargement. Veuillez vider manuellement le cache.');
                }
              }, true);
              
              // Intercepter les erreurs non capturées
              let rejectionReloadCount = 0;
              const MAX_REJECTION_RELOADS = 2;
              
              window.addEventListener('unhandledrejection', function(event) {
                const error = event.reason || '';
                const errorMessage = (typeof error === 'string' ? error : (error && error.message ? error.message : ''));
                
                // Ignorer les erreurs liées à url.length pour éviter les boucles infinies
                if (errorMessage.includes("can't access property") && errorMessage.includes("url") && errorMessage.includes("undefined")) {
                  console.warn('⚠️ Erreur url.length (promise rejection) détectée - Rechargement automatique désactivé');
                  event.preventDefault();
                  return;
                }
                
                const isWebpackError = 
                  (typeof error === 'string' && (
                    error.includes("ChunkLoadError")
                  )) ||
                  (error && error.message && (
                    error.message.includes("ChunkLoadError")
                  ));
                
                if (isWebpackError && rejectionReloadCount < MAX_REJECTION_RELOADS) {
                  rejectionReloadCount++;
                  // Logs réduits pour améliorer les performances
                  event.preventDefault();
                  setTimeout(function() {
                    window.location.reload();
                  }, 2000);
                } else if (isWebpackError) {
                  console.error('❌ Trop de tentatives de rechargement (promise rejection).');
                  event.preventDefault();
                }
              });
            })();
            
            // Bloquer les requêtes vers radar.cloudflare.com pour éviter les erreurs CORS
            (function() {
              // Vérifier que nous sommes côté client
              if (typeof window === 'undefined' || typeof window.fetch === 'undefined') {
                return;
              }
              
              const originalFetch = window.fetch;
              window.fetch = function(...args) {
                const url = args[0];
                if (typeof url === 'string' && url.includes('radar.cloudflare.com')) {
                  return Promise.reject(new Error('Blocked: radar.cloudflare.com'));
                }
                return originalFetch.apply(this, args);
              };
              
              if (typeof XMLHttpRequest !== 'undefined') {
                const originalXHROpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function(method, url, ...rest) {
                if (typeof url === 'string' && url.includes('radar.cloudflare.com')) {
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
            <ScrollToTop />
          </ClientOnly>
        </TokenProvider>
      </body>
    </html>
  )
}