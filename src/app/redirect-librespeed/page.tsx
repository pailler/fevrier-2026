'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

export default function RedirectLibreSpeed() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page de connexion
    const timer = setTimeout(() => {
      router.push('/login?error=librespeed_direct_access');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Accès Direct Interdit
        </h1>
        <p className="text-gray-600 mb-6">
          Vous ne pouvez pas accéder directement à LibreSpeed sans être connecté.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Veuillez vous connecter et utiliser le bouton d'accès depuis votre tableau de bord.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>Redirection automatique dans 3 secondes...</strong>
          </p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}
