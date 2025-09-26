'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MeTubeRedirectPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log('🔒 MeTube Redirect: Vérification de l\'authentification...');
        
        // Vérifier si l'utilisateur est connecté
        const response = await fetch('/api/metube-redirect', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          // L'API gère la redirection vers MeTube
          console.log('✅ MeTube Redirect: Redirection vers MeTube');
          // La redirection est gérée par l'API
          return;
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.log('❌ MeTube Redirect: Erreur d\'authentification:', errorData);
          setError(errorData.reason || 'Erreur d\'authentification');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('❌ MeTube Redirect Error:', err);
        setError('Erreur lors de la vérification de l\'authentification');
        setIsLoading(false);
      }
    };

    handleRedirect();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Vérification de l'accès à MeTube...</h2>
          <p className="text-gray-500 mt-2">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p>{error}</p>
          </div>
          <a 
            href="https://iahome.fr/encours" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retour à IAHome
          </a>
        </div>
      </div>
    );
  }

  return null;
}
