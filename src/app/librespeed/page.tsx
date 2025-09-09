'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LibreSpeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Token d\'accès manquant');
      setIsLoading(false);
      return;
    }

    // Rediriger vers LibreSpeed avec le token
    const librespeedUrl = `https://librespeed.iahome.fr?token=${token}`;
    window.location.href = librespeedUrl;
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirection vers LibreSpeed...</h2>
          <p className="text-gray-600">Vérification de votre accès en cours</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Accès refusé</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function LibreSpeedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement...</h2>
          <p className="text-gray-600">Vérification de votre accès</p>
        </div>
      </div>
    }>
      <LibreSpeedContent />
    </Suspense>
  );
}
