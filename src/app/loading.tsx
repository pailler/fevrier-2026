'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    // Afficher un message après 10 secondes si le chargement prend trop de temps
    const timeout = setTimeout(() => {
      setShowTimeout(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg
            className="w-8 h-8 text-white animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Chargement...
        </h2>
        
        <p className="text-gray-600 mb-4">
          Veuillez patienter pendant le chargement de la page.
        </p>

        {showTimeout && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-yellow-800 mb-2">
              ⚠️ Le chargement prend plus de temps que prévu.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-yellow-700 hover:text-yellow-900 underline"
            >
              Rafraîchir la page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

