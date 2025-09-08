'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function GradioAccessPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        console.log('🔍 Début vérification authentification...');
        
        // Créer un client Supabase côté client
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log('🔍 Client Supabase créé, vérification session...');

        // Vérifier la session
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('🔍 Résultat vérification session:', { session: !!session, error });

        if (error || !session) {
          console.log('❌ Erreur session:', error);
          console.log('❌ Session:', session);
          console.log('❌ Redirection vers /access-denied');
          router.push('/access-denied');
          return;
        }

        console.log('✅ Utilisateur authentifié:', session.user.email);

        // Utilisateur authentifié
        const user = session.user;
        const moduleName = 'gradio';

        console.log('🔍 Génération token pour module:', moduleName);

        // Générer un token automatique via API
        const response = await fetch('/api/generate-auto-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            moduleName: moduleName,
          }),
        });

        console.log('🔍 Réponse API generate-auto-token:', response.status);

        if (!response.ok) {
          console.error('❌ Erreur lors de la génération du token');
          router.push('/access-denied');
          return;
        }

        const { token } = await response.json();
        console.log('✅ Token généré avec succès');

        // Rediriger vers le wrapper sécurisé
        const wrapperUrl = `/api/secure-app-wrapper?app=gradio&auth_token=${token}&user_id=${user.id}&module=${moduleName}`;
        console.log('🔍 Redirection vers:', wrapperUrl);
        window.location.href = wrapperUrl;

      } catch (error) {
        console.error('❌ Erreur lors de la vérification d\'authentification:', error);
        router.push('/access-denied');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return null;
}
