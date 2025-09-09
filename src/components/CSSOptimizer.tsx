'use client';

import { useEffect } from 'react';

export default function CSSOptimizer() {
  useEffect(() => {
    // Optimiser le chargement des CSS pour éviter les warnings de préchargement
    const optimizeCSSLoading = () => {
      // Vérifier si les CSS sont déjà chargés
      const cssLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
      
      cssLinks.forEach((link: Element) => {
        const linkElement = link as HTMLLinkElement;
        
        // Convertir le preload en stylesheet si pas déjà fait
        if (linkElement.rel === 'preload' && linkElement.as === 'style') {
          // Vérifier si le CSS est utilisé dans les 2 secondes
          setTimeout(() => {
            if (linkElement.rel === 'preload') {
              // Convertir en stylesheet pour éviter le warning
              linkElement.rel = 'stylesheet';
              linkElement.removeAttribute('as');
            }
          }, 100);
        }
      });
    };

    // Exécuter l'optimisation après le chargement du DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeCSSLoading);
    } else {
      optimizeCSSLoading();
    }

    // Nettoyer l'event listener
    return () => {
      document.removeEventListener('DOMContentLoaded', optimizeCSSLoading);
    };
  }, []);

  return null; // Ce composant ne rend rien
}
