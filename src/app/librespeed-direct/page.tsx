'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LibreSpeedDirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Rediriger directement vers l'application LibreSpeed
      window.location.href = `https://librespeed.iahome.fr/?token=${token}`;
    } else {
      // Pas de token, rediriger vers login
      window.location.href = '/login?redirect=/librespeed';
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Redirection vers LibreSpeed...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Vous allez être redirigé vers l'application LibreSpeed.
          </p>
        </div>
      </div>
    </div>
  );
}
