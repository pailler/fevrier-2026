'use client';

import { useEffect } from 'react';

export default function AggressivePreloadCleaner() {
  useEffect(() => {
    // Fonction pour nettoyer les preloads problématiques
    const cleanPreloads = () => {
      // Supprimer les preloads de polices Geist
      const geistPreloads = document.querySelectorAll('link[rel="preload"][href*="geist"]');
      geistPreloads.forEach(link => {
        console.log('🗑️ Suppression preload Geist:', link.getAttribute('href'));
        link.remove();
      });

      // Supprimer les preloads d'og-image
      const ogImagePreloads = document.querySelectorAll('link[rel="preload"][href*="og-image"]');
      ogImagePreloads.forEach(link => {
        console.log('🗑️ Suppression preload og-image:', link.getAttribute('href'));
        link.remove();
      });

      // Supprimer les preloads de CSS non utilisés
      const cssPreloads = document.querySelectorAll('link[rel="preload"][as="style"]');
      cssPreloads.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('main') && !href.includes('app')) {
          console.log('🗑️ Suppression preload CSS non utilisé:', href);
          link.remove();
        }
      });

      // Supprimer les preloads de fonts non utilisés
      const fontPreloads = document.querySelectorAll('link[rel="preload"][as="font"]');
      fontPreloads.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('geist') || href.includes('woff2'))) {
          console.log('🗑️ Suppression preload font non utilisé:', href);
          link.remove();
        }
      });
    };

    // Nettoyer immédiatement
    cleanPreloads();

    // Nettoyer après un délai
    setTimeout(cleanPreloads, 100);
    setTimeout(cleanPreloads, 500);
    setTimeout(cleanPreloads, 1000);

    // Observer les changements du DOM
    const observer = new MutationObserver((mutations) => {
      let shouldClean = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'LINK' && element.getAttribute('rel') === 'preload') {
                const href = element.getAttribute('href');
                if (href && (href.includes('geist') || href.includes('og-image') || href.includes('woff2'))) {
                  shouldClean = true;
                }
              }
            }
          });
        }
      });
      
      if (shouldClean) {
        setTimeout(cleanPreloads, 10);
      }
    });

    // Commencer l'observation
    observer.observe(document.head, {
      childList: true,
      subtree: true
    });

    // Nettoyer l'observer au démontage
    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}


























