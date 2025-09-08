'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@supabase/auth-helpers-react';

export default function MeTubePage() {
  const router = useRouter();
  const user = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Vérifier si l'utilisateur est connecté
        if (!user) {
          setError('Vous devez être connecté pour accéder à MeTube');
          setIsLoading(false);
          return;
        }

        // Vérifier si le module MeTube est activé pour l'utilisateur
        const response = await fetch('/api/check-metube-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            moduleId: 'metube'
          })
        });

        if (!response.ok) {
          setError('Vous n\'avez pas accès au module MeTube');
          setIsLoading(false);
          return;
        }

        // Si tout est OK, ouvrir MeTube dans un nouvel onglet
        window.open('https://metube.iahome.fr', '_blank');
        // Rediriger vers /encours après un court délai
        setTimeout(() => {
          router.replace('/encours');
        }, 1000);
        
      } catch (error) {
        console.error('Erreur lors de la vérification d\'accès:', error);
        setError('Erreur lors de la vérification d\'accès');
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Vérification de l'accès...</h2>
          <p className="text-gray-600">Veuillez patienter pendant que nous vérifions vos permissions.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Accès refusé</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/encours')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Retour aux modules
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null; // Ne devrait jamais être atteint
}