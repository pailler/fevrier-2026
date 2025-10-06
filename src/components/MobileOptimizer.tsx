'use client';

import { useEffect } from 'react';

export default function MobileOptimizer() {
  useEffect(() => {
    // Détection mobile et optimisations
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Préchargement des ressources critiques
      const preloadCriticalResources = () => {
        // Précharger les polices critiques
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.href = '/fonts/inter-var.woff2';
        fontLink.as = 'font';
        fontLink.type = 'font/woff2';
        fontLink.crossOrigin = 'anonymous';
        document.head.appendChild(fontLink);

        // Précharger les images critiques
        const criticalImages = [
          '/images/logo.png',
          '/images/hero-bg.jpg'
        ];

        criticalImages.forEach(src => {
          const img = new Image();
          img.src = src;
        });
      };

      // Optimisation du viewport pour mobile
      const optimizeViewport = () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
          );
        }
      };

      // Gestion des erreurs de chargement
      const handleLoadErrors = () => {
        window.addEventListener('error', (event) => {
          if (event.target && (event.target as HTMLElement).tagName === 'IMG') {
            console.warn('Image load error on mobile:', event.target);
            // Retry logic pour les images
            setTimeout(() => {
              if (event.target) {
                (event.target as HTMLImageElement).src = (event.target as HTMLImageElement).src;
              }
            }, 1000);
          }
        });

        // Gestion des erreurs de script
        window.addEventListener('unhandledrejection', (event) => {
          console.warn('Unhandled promise rejection on mobile:', event.reason);
          // Empêcher l'erreur de remonter
          event.preventDefault();
        });
      };

      // Optimisation des performances
      const optimizePerformance = () => {
        // Réduire les animations sur mobile
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        }

        // Optimiser le scroll
        let ticking = false;
        const optimizeScroll = () => {
          if (!ticking) {
            requestAnimationFrame(() => {
              // Logique d'optimisation du scroll
              ticking = false;
            });
            ticking = true;
          }
        };

        window.addEventListener('scroll', optimizeScroll, { passive: true });
      };

      // Gestion de la connectivité
      const handleConnectivity = () => {
        const updateOnlineStatus = () => {
          if (navigator.onLine) {
            // Recharger les ressources critiques si nécessaire
            console.log('Connection restored');
          } else {
            console.log('Connection lost');
          }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
      };

      // Initialisation des optimisations
      preloadCriticalResources();
      optimizeViewport();
      handleLoadErrors();
      optimizePerformance();
      handleConnectivity();

      // Cleanup
      return () => {
        window.removeEventListener('scroll', () => {});
        window.removeEventListener('online', () => {});
        window.removeEventListener('offline', () => {});
      };
    }
  }, []);

  return null;
}



