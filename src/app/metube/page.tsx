'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MeTubePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        console.log('🔒 MeTube: Vérification de l\'authentification...');
        
        // Vérifier la session utilisateur
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ MeTube: Erreur session:', error);
          setError('Erreur de session');
          setIsLoading(false);
          return;
        }

        if (!session) {
          ;
          setIsLoading(false);
          return;
        }

        setUser(session.user);
        console.log('✅ MeTube: Utilisateur connecté:', session.user.email);

        // Vérifier l'accès à MeTube
        ;
        const accessResponse = await fetch('/api/check-module-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            userEmail: session.user.email,
            moduleId: 'metube'
          })
        });

        if (!accessResponse.ok) {
          const errorData = await accessResponse.json().catch(() => ({}));
          console.log('❌ MeTube: Accès refusé:', errorData);
          setError(errorData.message || 'Accès refusé à MeTube');
          setIsLoading(false);
          return;
        }

        // Générer un token d'accès et rediriger
        console.log('🔑 MeTube: Génération du token d\'accès...');
        const tokenResponse = await fetch('/api/metube-redirect', {
          method: 'GET',
          credentials: 'include'
        });

        if (tokenResponse.ok) {
          ;
          // La redirection est gérée par l'API
        } else {
          const errorData = await tokenResponse.json().catch(() => ({}));
          console.log('❌ MeTube: Erreur génération token:', errorData);
          setError(errorData.reason || 'Erreur lors de la génération du token');
          setIsLoading(false);
        }

      } catch (err) {
        console.error('❌ MeTube Error:', err);
        setError('Erreur lors de la vérification de l\'authentification');
        setIsLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès à MeTube</h1>
          <p className="text-gray-600">Vérification de votre authentification...</p>
          <div className="mt-4 space-y-2">
            <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
            <p className="text-sm text-gray-500">Veuillez patienter</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h2 className="text-xl font-semibold">Accès refusé</h2>
            </div>
            <p className="text-sm">{error}</p>
          </div>
          <div className="space-y-3">
            <a 
              href="https://iahome.fr/encours" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retour à IAHome
            </a>
            <div>
              <a 
                href="https://iahome.fr/login" 
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Se connecter
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Page d'authentification pour utilisateurs non connectés
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès à MeTube</h1>
            <p className="text-gray-600">Vous devez vous identifier pour accéder à MeTube</p>
          </div>
          
          <div className="space-y-4">
            <a 
              href="https://iahome.fr/login?redirect=/metube" 
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
            >
              Se connecter
            </a>
            <a 
              href="https://iahome.fr/register?redirect=/metube" 
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium inline-block"
            >
              Créer un compte
            </a>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <a 
              href="https://iahome.fr" 
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Retour à IAHome
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}