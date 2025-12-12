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
              
              const CACHE_VERSION = 'v' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
              const HEADER_VERSION = '2.4.0';
              console.log('🔄 Version cache:', CACHE_VERSION);
              console.log('🔄 Version Header attendue:', HEADER_VERSION);
              
              // Vérifier la version du Header stockée
              const storedHeaderVersion = localStorage.getItem('header_version');
              
              // Si la version stockée est différente, vider tous les caches et forcer le rechargement
              if (storedHeaderVersion && storedHeaderVersion !== HEADER_VERSION) {
                console.log('🔄 Version Header différente détectée (' + storedHeaderVersion + ' vs ' + HEADER_VERSION + ') - Vidage cache et rechargement');
                
                // VIDER TOUS LES CACHES IMMÉDIATEMENT
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    console.log('🗑️ Suppression de', names.length, 'caches...');
                    names.forEach(function(name) {
                      caches.delete(name);
                    });
                  });
                }
                
                // Vider le cache du navigateur
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    registrations.forEach(function(registration) {
                      registration.unregister();
                    });
                  });
                }
                
                // Vider localStorage et sessionStorage
                localStorage.clear();
                sessionStorage.clear();
                
                // Stocker la nouvelle version
                localStorage.setItem('header_version', HEADER_VERSION);
                localStorage.setItem('cache_version', CACHE_VERSION);
                
                // Forcer le rechargement avec cache bypass
                const timestamp = Date.now();
                const url = new URL(window.location.href);
                url.searchParams.set('_v', timestamp.toString());
                url.searchParams.set('_h', HEADER_VERSION);
                url.searchParams.set('_cb', '1');
                window.location.replace(url.toString());
                return;
              }
              
              // Si aucune version n'est stockée, la stocker
              if (!storedHeaderVersion) {
                localStorage.setItem('header_version', HEADER_VERSION);
              }
              
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
              
              // Vider localStorage et sessionStorage des anciennes versions de cache
              const oldKeys = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('cache') || key.includes('version')) && key !== 'header_version') {
                  oldKeys.push(key);
                }
              }
              oldKeys.forEach(function(key) {
                localStorage.removeItem(key);
              });
              
              localStorage.setItem('cache_version', CACHE_VERSION);
              
              // Vérifier la version du Header dans le DOM après chargement
              function checkHeaderVersion() {
                const header = document.querySelector('header[data-header-version]');
                if (header) {
                  const domVersion = header.getAttribute('data-header-version');
                  console.log('📋 Version Header DOM:', domVersion, 'Attendue:', HEADER_VERSION);
                  if (domVersion && domVersion !== HEADER_VERSION) {
                    console.log('🔄 Version Header DOM incohérente (' + domVersion + ' vs ' + HEADER_VERSION + ') - Rechargement forcé');
                    localStorage.setItem('header_version', HEADER_VERSION);
                    // Vider tous les caches avant le rechargement
                    if ('caches' in window) {
                      caches.keys().then(function(names) {
                        names.forEach(function(name) {
                          caches.delete(name);
                        });
                      });
                    }
                    const timestamp = Date.now();
                    const url = new URL(window.location.href);
                    url.searchParams.set('_v', timestamp.toString());
                    url.searchParams.set('_h', HEADER_VERSION);
                    url.searchParams.set('_cb', '1');
                    url.searchParams.set('_force', '1');
                    window.location.replace(url.toString());
                  } else if (domVersion === HEADER_VERSION) {
                    console.log('✅ Version Header correcte:', domVersion);
                    // S'assurer que la version est stockée
                    if (typeof localStorage !== 'undefined') {
                      localStorage.setItem('header_version', HEADER_VERSION);
                    }
                  }
                } else {
                  // Réessayer après un court délai (max 10 tentatives)
                  if (typeof sessionStorage !== 'undefined') {
                    const attempts = parseInt(sessionStorage.getItem('header_check_attempts') || '0', 10);
                    if (attempts < 10) {
                      sessionStorage.setItem('header_check_attempts', (attempts + 1).toString());
                      setTimeout(checkHeaderVersion, 200);
                    } else {
                      sessionStorage.removeItem('header_check_attempts');
                      console.warn('⚠️ Header non trouvé après 10 tentatives');
                    }
                  }
                }
              }
              
              // Vérifier après le chargement du DOM (plusieurs fois pour être sûr)
              if (typeof document !== 'undefined') {
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(checkHeaderVersion, 100);
                    setTimeout(checkHeaderVersion, 500);
                    setTimeout(checkHeaderVersion, 1000);
                  });
                } else {
                  setTimeout(checkHeaderVersion, 100);
                  setTimeout(checkHeaderVersion, 500);
                  setTimeout(checkHeaderVersion, 1000);
                }
              }
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
              // Vérifier que nous sommes côté client
              if (typeof window === 'undefined' || typeof window.fetch === 'undefined') {
                return;
              }
              
              const originalFetch = window.fetch;
              window.fetch = function(...args) {
                const url = args[0];
                if (typeof url === 'string' && url.includes('radar.cloudflare.com')) {
                  console.warn('Requête vers radar.cloudflare.com bloquée pour éviter les erreurs CORS');
                  return Promise.reject(new Error('Blocked: radar.cloudflare.com'));
                }
                return originalFetch.apply(this, args);
              };
              
              if (typeof XMLHttpRequest !== 'undefined') {
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