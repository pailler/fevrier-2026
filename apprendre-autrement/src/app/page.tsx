'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function RedirectComponent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const token = searchParams.get('token');
    const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    // En production, exiger un token
    if (!token && !isDevelopment) {
      setError('Token d\'accès manquant. Veuillez accéder à cette page via le bouton "Accéder à Apprendre Autrement".');
      return;
    }
    
    // Rediriger vers apprendre-autrement en préservant le token
    const redirectUrl = token 
      ? `/apprendre-autrement?token=${encodeURIComponent(token)}`
      : '/apprendre-autrement';
    window.location.href = redirectUrl;
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès restreint</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600 text-sm">
            Veuillez accéder à cette application via le bouton "Accéder à Apprendre Autrement" sur iahome.fr
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600">Redirection...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <RedirectComponent />
    </Suspense>
  );
}





