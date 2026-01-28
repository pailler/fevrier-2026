'use client';

import { useEffect } from 'react';

export default function ClientRedirectHandler() {
  useEffect(() => {
    // VIDAGE DU CACHE AU CHARGEMENT - VERSION AGRESSIVE POUR MOBILE
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    const HEADER_VERSION = '4.0.1'; // Incrémenté pour forcer le vidage de cache après rebuild
    
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
    
    // Redirection automatique pour qrcodes.iahome.fr
    if (window.location && window.location.hostname === 'qrcodes.iahome.fr') {
      window.location.href = '/qrcodes';
    }
  }, []);

  useEffect(() => {
    // Gestionnaire d'erreur global pour les erreurs webpack et chunks
    if (typeof window === 'undefined') {
      return;
    }
    
    let reloadCount = 0;
    const MAX_RELOADS = 2; // Limiter à 2 rechargements pour éviter les boucles infinies
    let chunkErrorCount = 0;
    const MAX_CHUNK_ERRORS = 1; // Recharger après 1 erreur de chunk
    
    const handleError = function(event: ErrorEvent) {
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
          if (typeof window === 'undefined' || !window.location) {
            return;
          }
          
          const reloadWindow = () => {
            if (typeof window !== 'undefined' && window.location) {
              window.location.reload();
            }
          };
          
          if ('caches' in window) {
            caches.keys().then(function(names) {
              names.forEach(function(name) {
                caches.delete(name);
              });
              reloadWindow();
            }).catch(function() {
              reloadWindow();
            });
          } else {
            reloadWindow();
          }
        }, 2000);
      } else if (isWebpackError) {
        console.error('❌ Trop de tentatives de rechargement. Veuillez vider manuellement le cache.');
      }
    };
    
    window.addEventListener('error', handleError, true);
    
    // Gestionnaire spécifique pour les erreurs de chargement de scripts/chunks
    const handleScriptError = function(event: Event) {
      const target = event.target as HTMLElement;
      if (target && target.tagName === 'SCRIPT') {
        const script = target as HTMLScriptElement;
        const src = script.src || '';
        
        // Détecter les erreurs de chunks Next.js
        if (src.includes('/_next/static/chunks/') || src.includes('/_next/static/js/')) {
          console.warn('⚠️ Erreur de chargement de chunk détectée:', src);
          
          // Vider le cache et recharger une seule fois
          if (reloadCount < MAX_RELOADS && typeof window !== 'undefined' && window.location) {
            reloadCount++;
            setTimeout(function() {
              if (typeof window === 'undefined' || !window.location) {
                return;
              }
              
              const reloadWindow = () => {
                if (typeof window !== 'undefined' && window.location) {
                  window.location.reload();
                }
              };
              
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  names.forEach(function(name) {
                    caches.delete(name);
                  });
                  reloadWindow();
                }).catch(function() {
                  reloadWindow();
                });
              } else {
                reloadWindow();
              }
            }, 1000);
          }
        }
      }
    };
    
    window.addEventListener('error', handleScriptError, true);
    
    // Intercepter les erreurs non capturées
    let rejectionReloadCount = 0;
    const MAX_REJECTION_RELOADS = 2;
    
    const handleRejection = function(event: PromiseRejectionEvent) {
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
    };
    
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('error', handleScriptError, true);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    // Bloquer les requêtes vers radar.cloudflare.com pour éviter les erreurs CORS
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
      XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
        if (typeof url === 'string' && url.includes('radar.cloudflare.com')) {
          return;
        }
        return originalXHROpen.apply(this, [method, url, ...rest]);
      };
    }
    
    return () => {
      window.fetch = originalFetch;
      if (typeof XMLHttpRequest !== 'undefined') {
        XMLHttpRequest.prototype.open = XMLHttpRequest.prototype.open;
      }
    };
  }, []);

  return null;
}

