'use client';
import { useEffect } from 'react';

export default function OptimizedWebVitals() {
  useEffect(() => {
    // Fonction pour mesurer les Core Web Vitals de manière sécurisée
    const measureWebVitals = () => {
      // Vérifier si PerformanceObserver est supporté
      if (!('PerformanceObserver' in window)) {
        return;
      }

      // Largest Contentful Paint (LCP)
      const measureLCP = () => {
        try {
          const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            // Envoyer les données à Google Analytics ou votre service d'analytics
            if (typeof (window as any).gtag !== 'undefined') {
              (window as any).gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: 'LCP',
                value: Math.round(lastEntry.startTime),
                non_interaction: true,
              });
            }
          });
          
          // Vérifier si largest-contentful-paint est supporté
          if (PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) {
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
          }
        } catch (error) {
          console.debug('LCP measurement failed:', error);
        }
      };

      // First Input Delay (FID)
      const measureFID = () => {
        try {
          const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
              const fid = (entry as any).processingStart - entry.startTime;
              
              if (typeof (window as any).gtag !== 'undefined') {
                (window as any).gtag('event', 'web_vitals', {
                  event_category: 'Web Vitals',
                  event_label: 'FID',
                  value: Math.round(fid),
                  non_interaction: true,
                });
              }
            });
          });
          
          // Vérifier si first-input est supporté
          if (PerformanceObserver.supportedEntryTypes?.includes('first-input')) {
            observer.observe({ entryTypes: ['first-input'] });
          }
        } catch (error) {
          console.debug('FID measurement failed:', error);
        }
      };

      // Cumulative Layout Shift (CLS) - Version sécurisée
      const measureCLS = () => {
        try {
          let clsValue = 0;
          let clsEntries: any[] = [];
          
          const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
                clsEntries.push(entry);
              }
            }
            
            // Envoyer les données à Google Analytics
            if (typeof (window as any).gtag !== 'undefined') {
              (window as any).gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: 'CLS',
                value: Math.round(clsValue * 1000),
                non_interaction: true,
              });
            }
          });
          
          // Vérifier si layout-shift est supporté
          if (PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
            observer.observe({ entryTypes: ['layout-shift'] });
          }
        } catch (error) {
          console.debug('CLS measurement failed:', error);
        }
      };

      // First Contentful Paint (FCP)
      const measureFCP = () => {
        try {
          const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
              if (typeof (window as any).gtag !== 'undefined') {
                (window as any).gtag('event', 'web_vitals', {
                  event_category: 'Web Vitals',
                  event_label: 'FCP',
                  value: Math.round(entry.startTime),
                  non_interaction: true,
                });
              }
            });
          });
          
          // Vérifier si paint est supporté
          if (PerformanceObserver.supportedEntryTypes?.includes('paint')) {
            observer.observe({ entryTypes: ['paint'] });
          }
        } catch (error) {
          console.debug('FCP measurement failed:', error);
        }
      };

      // Lancer les mesures
      measureLCP();
      measureFID();
      measureCLS();
      measureFCP();
    };

    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', measureWebVitals);
    } else {
      measureWebVitals();
    }

    // Cleanup
    return () => {
      document.removeEventListener('DOMContentLoaded', measureWebVitals);
    };
  }, []);

  return null; // Ce composant ne rend rien
}




