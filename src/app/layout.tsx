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
        {/* Google Search Console Verification */}
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        )}
        <script dangerouslySetInnerHTML={{
          __html: `
            // FORCER LE VIDAGE DU CACHE AU CHARGEMENT - VERSION AGRESSIVE
            (function() {
              const CACHE_VERSION = 'v' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
              console.log('🔄 Version cache:', CACHE_VERSION);
              
              // VIDER TOUS LES CACHES IMMÉDIATEMENT
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  console.log('🗑️ Suppression de', names.length, 'caches...');
                  names.forEach(function(name) {
                    caches.delete(name).then(function() {
                      console.log('✅ Cache supprimé:', name);
                    });
                  });
                });
              }
              
              // Vider le cache du navigateur
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  registrations.forEach(function(registration) {
                    registration.unregister();
                    console.log('✅ Service Worker désenregistré');
                  });
                });
              }
              
              // Vider localStorage et sessionStorage des anciennes versions
              const oldKeys = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('cache') || key.includes('version'))) {
                  oldKeys.push(key);
                }
              }
              oldKeys.forEach(function(key) {
                localStorage.removeItem(key);
                console.log('🗑️ Clé supprimée:', key);
              });
              
              // Vérifier si c'est un nouveau chargement ou un rechargement en boucle
              const lastCacheVersion = localStorage.getItem('cache_version');
              const reloadCount = parseInt(localStorage.getItem('reload_count') || '0', 10);
              
              // Si la version du cache n'a pas changé et qu'on a déjà rechargé, arrêter la boucle
              if (lastCacheVersion === CACHE_VERSION && reloadCount > 0) {
                console.warn('⚠️ Boucle de rechargement détectée - Arrêt du rechargement automatique');
                localStorage.setItem('reload_count', '0');
                return; // Arrêter l'exécution pour éviter la boucle
              }
              
              // Si c'est un nouveau chargement, incrémenter le compteur
              if (lastCacheVersion !== CACHE_VERSION) {
                localStorage.setItem('reload_count', '0');
              } else {
                localStorage.setItem('reload_count', (reloadCount + 1).toString());
              }
              
              localStorage.setItem('cache_version', CACHE_VERSION);
              
              // NE PAS modifier les attributs href/src des ressources - cela cause des rechargements infinis
              // NE PAS forcer de rechargement automatique
            })();
            
            // Redirection automatique pour qrcodes.iahome.fr
            if (window.location.hostname === 'qrcodes.iahome.fr') {
              window.location.href = '/qrcodes';
            }
            
            // Gestionnaire d'erreur global pour les erreurs webpack
            (function() {
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
                  console.warn('⚠️ Erreur Webpack détectée:', error);
                  console.warn('💡 Tentative de rechargement automatique dans 2 secondes... (' + reloadCount + '/' + MAX_RELOADS + ')');
                  
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
                  console.warn('⚠️ Erreur Webpack (promise rejection) détectée:', error);
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
            <ScrollToTop />
          </ClientOnly>
        </TokenProvider>
      </body>
    </html>
  )
}