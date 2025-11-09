'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>('Vérification de votre connexion...');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('🔍 Callback OAuth - Vérification de la session...');
        setStatus('Récupération de votre session...');
        
        // Vérifier d'abord s'il y a une erreur dans l'URL
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const error = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');
          
          if (error) {
            console.error('❌ Erreur OAuth dans l\'URL:', error, errorDescription);
            setStatus(`Erreur OAuth: ${error}`);
            setTimeout(() => {
              router.push(`/login?error=oauth_error&detail=${encodeURIComponent(errorDescription || error)}`);
            }, 2000);
            return;
          }
        }
        
        // Attendre un peu pour que Supabase traite le callback OAuth
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Récupérer la session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Erreur lors de la récupération de la session:', sessionError);
          setStatus('Erreur lors de la récupération de la session');
          setTimeout(() => {
            router.push('/login?error=session_error');
          }, 2000);
          return;
        }
        
        if (!session?.user) {
          console.log('❌ Aucune session trouvée');
          setStatus('Session non trouvée. Redirection...');
          setTimeout(() => {
            router.push('/login?error=no_session');
          }, 2000);
          return;
        }
        
        const user = session.user;
        console.log('✅ Session trouvée pour:', user.email);
        console.log('✅ Session user ID:', user.id);
        setStatus('Synchronisation de votre compte...');
        // Synchroniser le compte OAuth avec le profil existant (si nécessaire)
        try {
          console.log('🔄 Appel de l\'API de synchronisation...');
          const syncResponse = await fetch('/api/auth/sync-oauth-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              authUserId: user.id,
              email: user.email,
              name: user.user_metadata?.full_name,
              avatar_url: user.user_metadata?.avatar_url
            })
          });

          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            console.log('📋 Données de synchronisation:', syncData);
            if (syncData.migrated) {
              console.log('✅ Compte synchronisé avec succès (migration effectuée)');
            } else if (syncData.tokens_created) {
              console.log('✅ Compte synchronisé avec succès - 400 tokens créés');
            } else {
              console.log('✅ Compte synchronisé avec succès');
            }
            if (syncData.token_error) {
              console.error('⚠️ Erreur lors de la création des tokens:', syncData.token_error);
            }
          } else {
            const errorText = await syncResponse.text().catch(() => 'Erreur inconnue');
            console.error('❌ Erreur lors de la synchronisation:', errorText);
            console.error('❌ Status:', syncResponse.status);
            // Ne pas bloquer la connexion même si la synchronisation échoue
          }
        } catch (syncError: any) {
          console.error('❌ Erreur lors de l\'appel de synchronisation:', syncError?.message || syncError);
          // Ne pas bloquer la connexion même si la synchronisation échoue
        }
          
        setStatus('Finalisation de votre connexion...');
        
        // Initialiser la session dans user_sessions pour le suivi de durée (non bloquant)
        fetch('/api/initialize-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email
          })
        }).catch(initError => {
          console.warn('⚠️ Erreur lors de l\'initialisation de la session (non bloquant):', initError);
        });
        
        // Créer les données utilisateur pour localStorage
        const userData = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          avatar_url: user.user_metadata?.avatar_url || null
        };
        
        // Stocker dans localStorage
        try {
          localStorage.setItem('user_data', JSON.stringify(userData));
          if (session?.access_token) {
            localStorage.setItem('auth_token', session.access_token);
          }
          
          // Déclencher l'événement de connexion
          window.dispatchEvent(new Event('userLoggedIn'));
          console.log('✅ Utilisateur stocké dans localStorage:', userData.email);
        } catch (storageError) {
          console.error('❌ Erreur lors du stockage dans localStorage:', storageError);
          // Ne pas bloquer la connexion pour une erreur de localStorage
        }
        
        // Récupérer le paramètre redirect de l'URL
        const redirectParam = searchParams.get('redirect');
        const redirectUrl = redirectParam ? decodeURIComponent(redirectParam) : '/';
        
        setStatus('Redirection vers l\'accueil...');
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
      } catch (error: any) {
        console.error('❌ Erreur callback:', error);
        console.error('❌ Détails de l\'erreur:', error?.message, error?.stack);
        console.error('❌ Type d\'erreur:', typeof error);
        console.error('❌ Erreur complète:', JSON.stringify(error, null, 2));
        setStatus('Une erreur est survenue. Redirection...');
        
        // Attendre un peu avant de rediriger pour voir les logs
        setTimeout(() => {
          router.push(`/login?error=callback_error&detail=${encodeURIComponent(error?.message || 'Erreur inconnue')}`);
        }, 3000);
      }
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion en cours...</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chargement...</h1>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
