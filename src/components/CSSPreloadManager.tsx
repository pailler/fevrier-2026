'use client';

import { useEffect } from 'react';

export default function CSSPreloadManager() {
  useEffect(() => {
    // Fonction pour supprimer les preloads CSS non utilisés
    const removeUnusedPreloads = () => {
      // Supprimer les preloads CSS spécifiques qui causent des avertissements
      const problematicPreloads = [
        'baf5c5048dbe88aa.css',
        'f7c3aed20a88dd55.css'
      ];

      problematicPreloads.forEach(filename => {
        const links = document.querySelectorAll(`link[rel="preload"][href*="${filename}"]`);
        links.forEach(link => {
          console.log('🗑️ Suppression preload CSS non utilisé:', filename);
          link.remove();
        });
      });

      // Supprimer tous les preloads CSS génériques après un délai
      setTimeout(() => {
        const allPreloads = document.querySelectorAll('link[rel="preload"][as="style"]');
        allPreloads.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.includes('_next/static/css/')) {
            console.log('🗑️ Suppression preload CSS générique:', href);
            link.remove();
          }
        });
      }, 2000);
    };

    // Observer pour détecter les nouveaux preloads ajoutés dynamiquement
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'LINK') {
                const link = element as HTMLLinkElement;
                if (link.rel === 'preload' && link.as === 'style') {
                  const href = link.href;
                  if (href && href.includes('_next/static/css/')) {
                    console.log('🗑️ Suppression preload CSS détecté dynamiquement:', href);
                    setTimeout(() => link.remove(), 100);
                  }
                }
              }
            }
          });
        }
      });
    });

    // Démarrer l'observation
    observer.observe(document.head, { childList: true, subtree: true });

    // Supprimer les preloads existants
    removeUnusedPreloads();

    // Nettoyage
    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}