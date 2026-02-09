'use client';

import { useEffect } from 'react';

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Login page error:', error?.message, error?.stack);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-600 font-bold text-xl">!</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Erreur de chargement
        </h1>
        <p className="text-gray-600 mb-4">
          La page de connexion n&apos;a pas pu s&apos;afficher. Vous pouvez réessayer ou retourner à l&apos;accueil.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-center"
          >
            Retour à l&apos;accueil
          </a>
          <a
            href="/login"
            className="block w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Recharger la page de connexion
          </a>
        </div>
      </div>
    </div>
  );
}
