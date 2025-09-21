'use client';

import { useEffect } from 'react';

export default function LibreSpeedPage() {
  useEffect(() => {
    // Rediriger immédiatement vers la page d'accès refusé
    window.location.href = '/librespeed-blocked';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Redirection...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Vous allez être redirigé.
          </p>
        </div>
      </div>
    </div>
  );
}