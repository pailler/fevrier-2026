'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <a className="text-xl font-bold text-gray-900" href="/admin/dashboard">
                  🏠 Admin Panel
                </a>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" href="/admin/dashboard">
                  <span className="mr-2">📊</span>Tableau de bord
                </a>
                <a className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" href="/admin">
                  <span className="mr-2">⚙️</span>Gestion
                </a>
              </nav>
            </div>
            <div className="flex items-center">
              <a className="text-sm text-gray-500 hover:text-gray-700" href="/">
                ← Retour au site
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu d'erreur */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
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
            Erreur Admin
          </h1>
          
          <p className="text-gray-600 mb-4">
            Une erreur s'est produite dans l'interface d'administration.
          </p>

          {error.digest && (
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600">
                <strong>ID d'erreur:</strong> {error.digest}
              </p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Information de débogage
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Message: {error.message}</p>
                  <p className="mt-1">Veuillez contacter l'administrateur si le problème persiste.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🔄 Réessayer
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/dashboard'}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📊 Tableau de bord
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🏠 Retour au site
            </button>
          </div>

          {/* Actions d'urgence */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Actions d'urgence</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded transition-colors"
              >
                🔄 Recharger
              </button>
              <button
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir vider le cache local ?')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }
                }}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded transition-colors"
              >
                🗑️ Vider cache
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}








