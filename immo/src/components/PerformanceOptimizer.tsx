'use client';
import { useEffect } from 'react';

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Optimisation des performances pour le SEO
    const optimizePerformance = () => {
      // Preload des ressources critiques
      const preloadCriticalResources = () => {
        const criticalResources = [
          '/images/og-image.jpg',
        ];

        criticalResources.forEach(resource => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = resource;
          link.as = resource.endsWith('.woff2') ? 'font' : 'image';
          if (resource.endsWith('.woff2')) {
            link.crossOrigin = 'anonymous';
          }
          document.head.appendChild(link);
        });
      };

      // Optimisation des images lazy loading
      const optimizeImageLoading = () => {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              img.src = img.dataset.src || '';
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          });
        });

        images.forEach(img => imageObserver.observe(img));
      };

      // Optimisation des polices
      const optimizeFonts = () => {
        // Ajouter font-display: swap pour les polices système
        const style = document.createElement('style');
        style.textContent = `
          * {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          code, pre, .font-mono {
            font-family: "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Courier New", monospace;
          }
        `;
        document.head.appendChild(style);
      };

      // Mesure des Core Web Vitals
      const measureWebVitals = () => {
        // Largest Contentful Paint (LCP)
        const measureLCP = () => {
          try {
            new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries();
              const lastEntry = entries[entries.length - 1];
              // console.log('LCP:', lastEntry.startTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (error) {
            console.log('LCP measurement not supported');
          }
        };

        // First Input Delay (FID)
        const measureFID = () => {
          try {
            new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries();
              entries.forEach((entry) => {
                // console.log('FID:', (entry as any).processingStart - entry.startTime);
              });
            }).observe({ entryTypes: ['first-input'] });
          } catch (error) {
            console.log('FID measurement not supported');
          }
        };

        // Cumulative Layout Shift (CLS)
        const measureCLS = () => {
          try {
            let clsValue = 0;
            new PerformanceObserver((entryList) => {
              for (const entry of entryList.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                  clsValue += (entry as any).value;
                }
              }
              // console.log('CLS:', clsValue);
            }).observe({ entryTypes: ['layout-shift'] });
          } catch (error) {
            console.log('CLS measurement not supported');
          }
        };

        if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
          measureLCP();
          measureFID();
          measureCLS();
        }
      };

      // Optimisation des scripts
      const optimizeScripts = () => {
        // Déferrer les scripts non critiques
        const scripts = document.querySelectorAll('script[data-defer]');
        scripts.forEach(script => {
          script.setAttribute('defer', '');
        });
      };

      // Exécuter les optimisations
      preloadCriticalResources();
      optimizeImageLoading();
      optimizeFonts();
      optimizeScripts();
      measureWebVitals();
    };

    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizePerformance);
    } else {
      optimizePerformance();
    }

    // Cleanup
    return () => {
      document.removeEventListener('DOMContentLoaded', optimizePerformance);
    };
  }, []);

  return null;
}
