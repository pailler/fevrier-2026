import { useEffect, useState } from 'react';

export function useIframeDetection() {
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Détecter si l'application est dans une iframe
    const checkIfInIframe = () => {
      try {
        // Méthode 1: Comparer window avec window.parent
        if (window !== window.parent) {
          return true;
        }
        
        // Méthode 2: Vérifier si on peut accéder à window.top
        if (window !== window.top) {
          return true;
        }
        
        // Méthode 3: Vérifier les paramètres d'URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('iframe') === 'true' || urlParams.get('embedded') === 'true') {
          return true;
        }
        
        return false;
      } catch (e) {
        // Si on ne peut pas accéder à window.parent ou window.top, 
        // on est probablement dans une iframe avec des restrictions de sécurité
        return true;
      }
    };

    setIsInIframe(checkIfInIframe());

    // Écouter les changements de taille de fenêtre (pour détecter les changements d'iframe)
    const handleResize = () => {
      setIsInIframe(checkIfInIframe());
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isInIframe;
}


