'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApprendreAutrementPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    // Déterminer l'URL de l'application standalone
    const isDevelopment = window.location.hostname === 'localhost';
    const appUrl = isDevelopment
      ? `http://localhost:9001/apprendre-autrement${urlToken ? `?token=${encodeURIComponent(urlToken)}` : ''}`
      : `https://apprendre-autrement.iahome.fr${urlToken ? `?token=${encodeURIComponent(urlToken)}` : ''}`;

    // Rediriger immédiatement vers l'application standalone
    console.log('🔄 Redirection vers l\'application standalone:', appUrl);
    window.location.href = appUrl;
  }, [router]);

  // Afficher un loader pendant la redirection
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600">Redirection vers l'application...</p>
      </div>
    </div>
  );
}

