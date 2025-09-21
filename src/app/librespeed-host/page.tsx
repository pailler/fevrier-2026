'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LibreSpeedHost() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleLibreSpeedAccess = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          // Pas de token, rediriger vers login
          window.location.href = '/login?redirect=/librespeed';
          return;
        }

        // Valider le token
        const response = await fetch('/api/validate-librespeed-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: token }),
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            // Incrémenter le compteur d'accès
            try {
              await fetch('/api/increment-librespeed-access', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: data.magicLinkData.userId,
                  userEmail: data.magicLinkData.userEmail
                }),
              });
            } catch (err) {
              console.warn('Erreur incrémentation compteur:', err);
            }

            // Rediriger directement vers l'application LibreSpeed
            window.location.href = `https://librespeed.iahome.fr/?token=${token}`;
            return;
          } else {
            setError('Token invalide ou expiré');
          }
        } else {
          setError('Erreur de validation du token');
        }
      } catch (err) {
        console.error('Erreur LibreSpeed:', err);
        setError('Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    handleLibreSpeedAccess();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Accès à LibreSpeed...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Validation de votre accès en cours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Erreur d'accès
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/login?redirect=/librespeed'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
