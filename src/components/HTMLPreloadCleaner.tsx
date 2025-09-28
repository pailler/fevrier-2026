'use client';

import { useEffect } from 'react';

export default function HTMLPreloadCleaner() {
  useEffect(() => {
    // Fonction pour supprimer les preloads problématiques
    const removePreloads = () => {
      // Supprimer les preloads de polices Geist
      const geistFonts = document.querySelectorAll('link[rel="preload"][as="font"][href*="geist"]');
      geistFonts.forEach(link => {
        console.log('🗑️ HTMLPreloadCleaner: Suppression preload police Geist:', link.getAttribute('href'));
        link.remove();
      });

      // Supprimer les preloads d'images og-image
      const ogImages = document.querySelectorAll('link[rel="preload"][as="image"][href*="og-image"]');
      ogImages.forEach(link => {
        console.log('🗑️ HTMLPreloadCleaner: Suppression preload image og-image:', link.getAttribute('href'));
        link.remove();
      });

      // Supprimer TOUS les preloads de polices (approche plus agressive)
      const allFonts = document.querySelectorAll('link[rel="preload"][as="font"]');
      allFonts.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('geist') || href.includes('woff2'))) {
          console.log('🗑️ HTMLPreloadCleaner: Suppression preload police:', href);
          link.remove();
        }
      });

      // Supprimer TOUS les preloads d'images (approche plus agressive)
      const allImages = document.querySelectorAll('link[rel="preload"][as="image"]');
      allImages.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('og-image') || href.includes('.jpg') || href.includes('.png'))) {
          console.log('🗑️ HTMLPreloadCleaner: Suppression preload image:', href);
          link.remove();
        }
      });
    };

    // Exécuter immédiatement
    removePreloads();

    // Répéter la suppression toutes les 50ms pendant 10 secondes
    const interval = setInterval(removePreloads, 50);
    setTimeout(() => clearInterval(interval), 10000);

    // Observer les changements du DOM
    const observer = new MutationObserver((mutations) => {
      let shouldRemove = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'LINK') {
                const link = element as HTMLLinkElement;
                if (link.rel === 'preload') {
                  const href = link.getAttribute('href');
                  const as = link.getAttribute('as');
                  
                  if ((as === 'font' && href && (href.includes('geist') || href.includes('woff2'))) ||
                      (as === 'image' && href && (href.includes('og-image') || href.includes('.jpg') || href.includes('.png')))) {
                    console.log('🗑️ HTMLPreloadCleaner: Suppression preload détecté:', href);
                    link.remove();
                    shouldRemove = true;
                  }
                }
              }
            }
          });
        }
      });

      // Si on a supprimé des éléments, relancer la suppression complète
      if (shouldRemove) {
        setTimeout(removePreloads, 10);
      }
    });

    observer.observe(document.head, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['rel', 'as', 'href']
    });

    // Nettoyage
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
}







