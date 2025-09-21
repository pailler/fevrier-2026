'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LibreSpeedRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page de login avec un paramètre de redirection
    router.replace('/login?redirect=/librespeed');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Redirection en cours...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Vous allez être redirigé vers la page de connexion.
          </p>
        </div>
      </div>
    </div>
  );
}
