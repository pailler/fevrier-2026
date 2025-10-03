'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Vérifier s'il y a des paramètres d'erreur dans l'URL
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          setError(`Erreur d'authentification: ${errorDescription || errorParam}`);
          setTimeout(() => router.push('/login?error=oauth_error'), 3000);
          return;
        }

        // Attendre que Supabase traite la session
        await new Promise(resolve => setTimeout(resolve, 2000));
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          // Essayer de récupérer l'utilisateur directement
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError || !userData.user) {
            setError('Aucune session trouvée. Veuillez réessayer.');
            setTimeout(() => router.push('/login?error=no_session'), 3000);
            return;
          }
          
          // Traiter l'utilisateur trouvé
          await processUser(userData.user);
          return;
        }

        if (sessionData.session?.user) {
          await processUser(sessionData.session.user);
        } else {
          setError('Aucune session trouvée. Veuillez réessayer.');
          setTimeout(() => router.push('/login?error=no_session'), 3000);
        }
      } catch (error) {
        setError('Une erreur est survenue. Veuillez réessayer.');
        setTimeout(() => router.push('/login?error=callback_failed'), 3000);
      } finally {
        setLoading(false);
      }
    };

    const processUser = async (user: any) => {
      try {
        // Utiliser l'API route pour créer l'utilisateur avec la clé de service
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur lors de la création de l\'utilisateur:', errorData);
        }

        // Rediriger vers la page d'accueil
        router.push('/');
      } catch (error) {
        console.error('Erreur lors du traitement de l\'utilisateur:', error);
        setError('Erreur lors du traitement de l\'utilisateur.');
        setTimeout(() => router.push('/login?error=user_processing_failed'), 3000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de connexion</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirection automatique dans quelques secondes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion réussie</h1>
        <p className="text-gray-600">Redirection vers la page d'accueil...</p>
      </div>
    </div>
  );
}
