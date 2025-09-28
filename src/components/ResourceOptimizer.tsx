'use client';

import { useEffect } from 'react';

export default function ResourceOptimizer() {
  useEffect(() => {
    // Optimiser le préchargement des polices
    const optimizeFonts = () => {
      // Précharger les polices seulement quand elles sont nécessaires
      const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
      fontLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('geist-sans') || href.includes('geist-mono'))) {
          // Ajouter un timeout pour éviter les warnings de préchargement
          setTimeout(() => {
            if (!link.hasAttribute('data-used')) {
              link.setAttribute('data-used', 'true');
            }
          }, 1000);
        }
      });
    };

    // Optimiser le préchargement des images
    const optimizeImages = () => {
      const imageLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
      imageLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('og-image')) {
          // Marquer l'image comme utilisée après un court délai
          setTimeout(() => {
            if (!link.hasAttribute('data-used')) {
              link.setAttribute('data-used', 'true');
            }
          }, 500);
        }
      });
    };

    // Exécuter les optimisations
    optimizeFonts();
    optimizeImages();

    // Nettoyer les ressources non utilisées après 5 secondes
    const cleanup = setTimeout(() => {
      const unusedLinks = document.querySelectorAll('link[rel="preload"]:not([data-used])');
      unusedLinks.forEach(link => {
        // Supprimer les liens de préchargement non utilisés
        link.remove();
      });
    }, 5000);

    return () => clearTimeout(cleanup);
  }, []);

  return null; // Ce composant ne rend rien
}








