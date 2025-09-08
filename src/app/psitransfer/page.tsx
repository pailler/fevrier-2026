'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PsiTransferRedirectPage() {
  const router = useRouter();
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    // Maintenir l'URL iahome.fr/psitransfer
    const maintainUrl = () => {
      if (window.location.href !== 'https://iahome.fr/psitransfer') {
        window.history.replaceState(null, '', 'https://iahome.fr/psitransfer');
      }
    };
    
    // Maintenir l'URL périodiquement
    const interval = setInterval(maintainUrl, 1000);
    
    // Intercepter les changements d'URL
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(state, title, url) {
      if (url && typeof url === 'string' && url.includes('iahome.fr')) {
        originalPushState.call(this, state, title, url);
      } else {
        originalPushState.call(this, state, title, 'https://iahome.fr/psitransfer');
      }
    };
    
    window.history.replaceState = function(state, title, url) {
      if (url && typeof url === 'string' && url.includes('iahome.fr')) {
        originalReplaceState.call(this, state, title, url);
      } else {
        originalReplaceState.call(this, state, title, 'https://iahome.fr/psitransfer');
      }
    };
    
    // Empêcher le changement d'URL lors de la navigation directe
    window.addEventListener('popstate', function(event) {
      if (!window.location.href.includes('iahome.fr/psitransfer')) {
        window.history.replaceState(null, '', 'https://iahome.fr/psitransfer');
      }
    });
    
    // Assurer que l'URL est correcte au chargement initial
    maintainUrl();
    
    return () => {
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-blue-50" style={{ marginTop: '80px' }}>
      {!iframeLoaded && (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-blue-700">Chargement de PsiTransfer...</p>
          <p className="text-sm text-gray-500">Veuillez patienter, l'application se charge en arrière-plan.</p>
        </div>
      )}
      
      <iframe
        src="/api/psitransfer-proxy"
        title="PsiTransfer - Partage de fichiers sécurisé"
        className="w-full h-full border-0"
        style={{ 
          position: 'fixed',
          top: '80px',
          left: '0',
          width: '100%',
          height: 'calc(100% - 80px)',
          border: 'none',
          zIndex: '9999'
        }}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        onLoad={() => setIframeLoaded(true)}
      />
    </div>
  );
}
