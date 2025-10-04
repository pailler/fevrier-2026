'use client';

import { useEffect } from 'react';

export default function CacheManager() {
  useEffect(() => {
    // Gestion du cache pour mobile
    const manageCache = () => {
      // Vérifier si le service worker est supporté
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        });
      }

      // Nettoyer le cache du navigateur
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            // Garder seulement les caches récents
            if (cacheName.includes('old-') || cacheName.includes('stale-')) {
              caches.delete(cacheName);
            }
          });
        });
      }
    };

    // Gestion des rechargements automatiques
    const handleAutoReload = () => {
      let reloadAttempts = 0;
      const maxAttempts = 3;

      const checkAndReload = () => {
        // Vérifier si la page est dans un état d'erreur
        const hasError = document.querySelector('[data-error="true"]');
        const isLoading = document.querySelector('[data-loading="true"]');
        
        if (hasError && !isLoading && reloadAttempts < maxAttempts) {
          reloadAttempts++;
          console.log(`Tentative de rechargement automatique ${reloadAttempts}/${maxAttempts}`);
          
          setTimeout(() => {
            window.location.reload();
          }, 2000 * reloadAttempts); // Délai progressif
        }
      };

      // Vérifier toutes les 5 secondes
      const interval = setInterval(checkAndReload, 5000);

      // Nettoyer l'intervalle après 2 minutes
      setTimeout(() => {
        clearInterval(interval);
      }, 120000);

      return () => clearInterval(interval);
    };

    // Gestion de la connectivité
    const handleConnectivity = () => {
      let isOnline = navigator.onLine;
      let reconnectAttempts = 0;
      const maxReconnectAttempts = 5;

      const checkConnection = async () => {
        try {
          const response = await fetch('/api/health', {
            method: 'HEAD',
            cache: 'no-cache',
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok && !isOnline) {
            console.log('Connexion rétablie');
            isOnline = true;
            reconnectAttempts = 0;
            // Recharger la page si nécessaire
            if (document.visibilityState === 'visible') {
              window.location.reload();
            }
          }
        } catch (error) {
          if (isOnline) {
            console.log('Connexion perdue');
            isOnline = false;
          }
          
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(checkConnection, 3000 * reconnectAttempts);
          }
        }
      };

      // Vérifier la connexion toutes les 10 secondes
      const interval = setInterval(checkConnection, 10000);

      // Écouter les événements de connectivité
      window.addEventListener('online', () => {
        isOnline = true;
        reconnectAttempts = 0;
        checkConnection();
      });

      window.addEventListener('offline', () => {
        isOnline = false;
      });

      return () => {
        clearInterval(interval);
        window.removeEventListener('online', checkConnection);
        window.removeEventListener('offline', checkConnection);
      };
    };

    // Gestion des erreurs de chargement de ressources
    const handleResourceErrors = () => {
      const handleError = (event: Event) => {
        const target = event.target as HTMLElement;
        
        if (target.tagName === 'IMG') {
          console.warn('Erreur de chargement d\'image:', target);
          // Retry avec backoff exponentiel
          const img = target as HTMLImageElement;
          const originalSrc = img.src;
          let retryCount = 0;
          const maxRetries = 3;

          const retry = () => {
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(() => {
                img.src = originalSrc + '?retry=' + retryCount;
              }, 1000 * Math.pow(2, retryCount - 1));
            }
          };

          retry();
        } else if (target.tagName === 'SCRIPT') {
          console.warn('Erreur de chargement de script:', target);
          // Recharger la page si c'est un script critique
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      };

      document.addEventListener('error', handleError, true);
      
      return () => {
        document.removeEventListener('error', handleError, true);
      };
    };

    // Initialisation
    manageCache();
    const cleanupReload = handleAutoReload();
    const cleanupConnectivity = handleConnectivity();
    const cleanupResources = handleResourceErrors();

    // Cleanup
    return () => {
      cleanupReload();
      cleanupConnectivity();
      cleanupResources();
    };
  }, []);

  return null;
}
