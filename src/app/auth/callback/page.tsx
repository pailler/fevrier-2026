'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<string>('Vérification de votre connexion...');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('🔍 Callback OAuth - Vérification de la session...');
        setStatus('Récupération de votre session...');
        
        // Attendre un peu pour que Supabase traite le callback
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Récupérer la session sans gestion d'erreur détaillée
        const { data: { session } } = await supabase.auth.getSession();
        

        if (session?.user) {
          console.log('✅ Session trouvée pour:', session.user.email);
          setStatus('Finalisation de votre connexion...');
          
          // Créer les données utilisateur pour localStorage
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email,
            avatar_url: session.user.user_metadata?.avatar_url || null
          };
          
          // Stocker dans localStorage
          localStorage.setItem('user_data', JSON.stringify(userData));
          localStorage.setItem('auth_token', session.access_token);
          
          // Déclencher l'événement de connexion
          window.dispatchEvent(new Event('userLoggedIn'));
          
          console.log('✅ Utilisateur stocké dans localStorage:', userData.email);
          
          // Attendre un peu pour que Supabase crée le profil automatiquement
          // Ne pas essayer de créer le profil manuellement pour éviter les conflits
          console.log('✅ Profil sera créé automatiquement par Supabase si besoin');
          
          setStatus('Redirection vers l\'accueil...');
          setTimeout(() => router.push('/'), 1000);
        } else {
          console.log('❌ Aucune session trouvée');
          setStatus('Session non trouvée. Redirection...');
          setTimeout(() => router.push('/login?error=no_session'), 2000);
        }
      } catch (error) {
        console.error('❌ Erreur callback:', error);
        setStatus('Une erreur est survenue. Redirection...');
        setTimeout(() => router.push('/login?error=callback_error'), 2000);
      }
    };

    handleAuth();
  }, [router]);

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
