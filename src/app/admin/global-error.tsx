'use client';

import { useEffect } from 'react';

export default function AdminGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin global error:', error);
  }, [error]);

  return (
    <html lang="fr">
      <head>
        <title>Erreur Admin - IA Home</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <div className="min-h-screen bg-gray-50">
          {/* Header Admin simplifié */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <a className="text-xl font-bold text-gray-900" href="/admin/dashboard">
                    🏠 Admin Panel - Erreur Critique
                  </a>
                </div>
                <div className="flex items-center">
                  <a className="text-sm text-gray-500 hover:text-gray-700" href="/">
                    ← Retour au site
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu d'erreur critique */}
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
            <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Erreur Critique Admin
              </h1>
              
              <p className="text-gray-600 mb-6">
                Une erreur critique s'est produite dans l'interface d'administration.
                Le système a été interrompu pour éviter des dommages supplémentaires.
              </p>

              {error.digest && (
                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">
                    <strong>ID d'erreur:</strong> {error.digest}
                  </p>
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Erreur critique détectée
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p><strong>Message:</strong> {error.message}</p>
                      <p className="mt-2">Cette erreur nécessite une intervention immédiate de l'administrateur.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={reset}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  🔄 Tenter de récupérer
                </button>
                
                <button
                  onClick={() => window.location.href = '/admin/dashboard'}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  📊 Aller au tableau de bord
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  🏠 Retour au site principal
                </button>
              </div>

              {/* Actions de récupération d'urgence */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Actions de récupération d'urgence</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Cette action va vider tous les caches et redémarrer l\'application. Continuer ?')) {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = '/admin/dashboard';
                      }
                    }}
                    className="text-sm bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-2 rounded transition-colors"
                  >
                    🔧 Réinitialiser l'application
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Cette action va recharger complètement la page. Continuer ?')) {
                        window.location.reload();
                      }
                    }}
                    className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded transition-colors"
                  >
                    🔄 Recharger la page
                  </button>
                </div>
              </div>

              {/* Informations techniques */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <details className="text-left">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                    📋 Informations techniques
                  </summary>
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                    <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
                    <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                    <p><strong>URL:</strong> {window.location.href}</p>
                    <p><strong>Stack:</strong></p>
                    <pre className="mt-1 text-xs overflow-auto max-h-32">
                      {error.stack || 'Stack trace non disponible'}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}





