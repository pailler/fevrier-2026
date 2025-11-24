'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logger l'erreur pour le débogage
    console.error('❌ Global Error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Détecter spécifiquement les erreurs webpack
    // Ignorer les erreurs url.length pour éviter les boucles infinies
    const isUrlLengthError = 
      error.message?.includes("can't access property") &&
      error.message?.includes("url") &&
      error.message?.includes("undefined");
    
    const isWebpackError = 
      !isUrlLengthError && (
        error.message?.includes("ChunkLoadError") ||
        error.message?.includes("Loading chunk") ||
        error.stack?.includes("webpack")
      );
    
    if (isUrlLengthError) {
      console.error('❌ Erreur url.length détectée - Rechargement automatique désactivé pour éviter les boucles infinies');
      console.error('💡 Veuillez vider le cache du navigateur manuellement (Ctrl+Shift+Delete)');
    } else if (isWebpackError) {
      console.warn('⚠️ Erreur Webpack détectée - Tentative de rechargement automatique...');
      // Essayer de recharger la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [error]);

  const isUrlLengthError = 
    error.message?.includes("can't access property") &&
    error.message?.includes("url") &&
    error.message?.includes("undefined");
  
  const isWebpackError = 
    !isUrlLengthError && (
      error.message?.includes("ChunkLoadError") ||
      error.message?.includes("Loading chunk")
    );

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isWebpackError ? 'Erreur de chargement' : 'Une erreur est survenue'}
            </h1>
            
            <p className="text-gray-600 mb-4">
              {isWebpackError 
                ? 'Un problème de chargement des ressources a été détecté. La page va se recharger automatiquement.'
                : 'Une erreur inattendue s\'est produite. Veuillez réessayer.'}
            </p>
            
            {error.message && (
              <p className="text-sm text-red-600 mb-6 p-4 bg-red-50 rounded-lg break-words">
                {error.message}
              </p>
            )}
            
            <div className="space-y-3">
              {!isWebpackError && (
                <button
                  onClick={reset}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Réessayer
                </button>
              )}
              
              <button
                onClick={() => {
                  // Vider le cache et recharger
                  if ('caches' in window) {
                    caches.keys().then(names => {
                      names.forEach(name => caches.delete(name));
                    });
                  }
                  window.location.href = '/';
                }}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Retour à l'accueil
              </button>
              
              {isWebpackError && (
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Recharger la page maintenant
                </button>
              )}
            </div>
            
            {isWebpackError && (
              <p className="text-xs text-gray-500 mt-4">
                💡 Si le problème persiste, videz le cache de votre navigateur (Ctrl+Shift+Delete)
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}




