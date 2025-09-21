'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';

export default function LibreSpeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initializeLibreSpeed = async () => {
      try {
        // Vérifier si un token est présent dans l'URL
        const token = searchParams.get('token');
        
        if (token) {
          // Valider le token avec l'API
          const response = await fetch('/api/validate-librespeed-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token }),
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.magicLinkData);
            
            // Incrémenter le compteur d'accès
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

            // Rediriger directement vers l'application LibreSpeed
            window.location.href = `https://librespeed.iahome.fr/?token=${token}`;
            return;
          } else {
            setError('Token invalide ou expiré');
          }
        } else {
          // Pas de token, vérifier la session utilisateur
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            setUser(session.user);
            
            // Générer un nouveau token pour l'utilisateur connecté
            const tokenResponse = await fetch('/api/librespeed-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: session.user.id,
                userEmail: session.user.email
              }),
            });

            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json();
              // Rediriger vers LibreSpeed avec le nouveau token
              window.location.href = `https://librespeed.iahome.fr/?token=${tokenData.token}`;
              return;
            } else {
              setError('Impossible de générer un token d\'accès');
            }
          } else {
            // Pas de session, rediriger vers login
            router.replace('/login?redirect=/librespeed');
            return;
          }
        }
      } catch (err) {
        console.error('Erreur LibreSpeed:', err);
        setError('Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLibreSpeed();
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Chargement de LibreSpeed...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Veuillez patienter pendant la préparation de votre accès.
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
                onClick={() => router.push('/login?redirect=/librespeed')}
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