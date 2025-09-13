'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Traitement du callback d\'authentification...');
        
        // Récupérer la session depuis l'URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erreur lors de la récupération de la session:', error);
          setError('Erreur lors de la connexion. Veuillez réessayer.');
          setTimeout(() => router.push('/login?error=auth_failed'), 3000);
          return;
        }

        if (data.session?.user) {
          console.log('✅ Utilisateur connecté:', data.session.user.email);
          
          // Vérifier si l'utilisateur existe dans la table users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', data.session.user.email)
            .single();

          if (userError && userError.code !== 'PGRST116') {
            console.error('❌ Erreur lors de la vérification de l\'utilisateur:', userError);
          }

          // Si l'utilisateur n'existe pas, le créer
          if (!userData) {
            console.log('📝 Création du nouvel utilisateur...');
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                email: data.session.user.email,
                name: data.session.user.user_metadata?.full_name || data.session.user.email,
                avatar_url: data.session.user.user_metadata?.avatar_url || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (insertError) {
              console.error('❌ Erreur lors de la création de l\'utilisateur:', insertError);
            } else {
              console.log('✅ Utilisateur créé avec succès');
            }
          }

          // Rediriger vers la page d'accueil
          router.push('/');
        } else {
          console.log('❌ Aucune session trouvée');
          setError('Aucune session trouvée. Veuillez réessayer.');
          setTimeout(() => router.push('/login?error=no_session'), 3000);
        }
      } catch (error) {
        console.error('❌ Erreur lors du traitement du callback:', error);
        setError('Une erreur est survenue. Veuillez réessayer.');
        setTimeout(() => router.push('/login?error=callback_failed'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

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
