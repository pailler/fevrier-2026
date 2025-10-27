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
        console.log('🔍 Processing OAuth callback...');
        
        // Vérifier s'il y a des paramètres d'erreur dans l'URL
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          console.error('❌ OAuth Error:', errorDescription || errorParam);
          setError(`Erreur d'authentification: ${errorDescription || errorParam}`);
          setTimeout(() => router.push('/login?error=oauth_error'), 3000);
          return;
        }

        // Récupérer la session directement
        console.log('📋 Checking for session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session Error:', sessionError);
          setError('Erreur lors de la récupération de la session.');
          setTimeout(() => router.push('/login?error=session_error'), 3000);
          return;
        }

        if (sessionData.session?.user) {
          console.log('✅ Session found for:', sessionData.session.user.email);
          
          // Vérifier si l'utilisateur existe dans profiles
          const profileResponse = await fetch('/api/check-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: sessionData.session.user.email }),
          });

          const profileData = await profileResponse.json();
          
          if (!profileData.exists) {
            console.log('📝 Creating profile for new user...');
            // Créer le profil si nécessaire
            const createResponse = await fetch('/api/auth/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: sessionData.session.user.email,
                full_name: sessionData.session.user.user_metadata?.full_name || sessionData.session.user.email,
              }),
            });
            
            if (!createResponse.ok) {
              console.error('Failed to create profile');
            }
          }

          // Rediriger vers la page d'accueil
          console.log('🚀 Redirecting to home...');
          router.push('/');
        } else {
          console.error('❌ No session found');
          setError('Aucune session trouvée. Veuillez réessayer.');
          setTimeout(() => router.push('/login?error=no_session'), 3000);
        }
      } catch (error) {
        console.error('❌ Callback Error:', error);
        setError('Une erreur est survenue. Veuillez réessayer.');
        setTimeout(() => router.push('/login?error=callback_failed'), 3000);
      } finally {
        setLoading(false);
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
