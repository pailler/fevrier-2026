'use client';
import { useEffect } from 'react';

export default function WebVitals() {
  useEffect(() => {
    // Fonction pour mesurer les Core Web Vitals
    const measureWebVitals = () => {
      // Largest Contentful Paint (LCP)
      const measureLCP = () => {
        if ('PerformanceObserver' in window) {
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
            
            // console.log('LCP:', lastEntry.startTime);
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
      };

      // First Input Delay (FID)
      const measureFID = () => {
        if ('PerformanceObserver' in window) {
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
              
              // console.log('FID:', fid);
            });
          });
          
          observer.observe({ entryTypes: ['first-input'] });
        }
      };

      // Cumulative Layout Shift (CLS)
      const measureCLS = () => {
        if ('PerformanceObserver' in window) {
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
            
            // console.log('CLS:', clsValue);
          });
          
          observer.observe({ entryTypes: ['layout-shift'] });
        }
      };

      // First Contentful Paint (FCP)
      const measureFCP = () => {
        if ('PerformanceObserver' in window) {
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
              
              // console.log('FCP:', entry.startTime);
            });
          });
          
          observer.observe({ entryTypes: ['paint'] });
        }
      };

      // Time to Interactive (TTI)
      const measureTTI = () => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
              if (entry.name === 'TTI') {
                if (typeof (window as any).gtag !== 'undefined') {
                  (window as any).gtag('event', 'web_vitals', {
                    event_category: 'Web Vitals',
                    event_label: 'TTI',
                    value: Math.round(entry.startTime),
                    non_interaction: true,
                  });
                }
                
                // console.log('TTI:', entry.startTime);
              }
            });
          });
          
          observer.observe({ entryTypes: ['measure'] });
        }
      };

      // Mesurer les métriques
      measureLCP();
      measureFID();
      measureCLS();
      measureFCP();
      measureTTI();
    };

    // Attendre que le DOM soit chargé
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

  return null;
}
