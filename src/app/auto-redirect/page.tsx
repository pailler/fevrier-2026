'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';

function AutoRedirectContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const autoToken = searchParams.get('auto_token');
  const userId = searchParams.get('user_id');
  const targetUrl = searchParams.get('target');

  useEffect(() => {
    const handleAutoRedirect = async () => {
      try {
        // Vérifier que l'utilisateur est toujours connecté
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || session.user.id !== userId) {
          setError('Session utilisateur invalide');
          return;
        }
        
        if (!autoToken || !targetUrl) {
          setError('Paramètres de redirection manquants');
          return;
        }
        
        // Rediriger automatiquement après un court délai
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 1000);
        
      } catch (error) {
        setError('Erreur lors de la redirection automatique');
      } finally {
        setLoading(false);
      }
    };
    
    handleAutoRedirect();
  }, [autoToken, userId, targetUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-blue-900">
            Redirection automatique en cours...
          </h2>
          <p className="mt-2 text-blue-700">
            Vous allez être redirigé automatiquement vers l'application.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-4">
            Erreur de redirection
          </h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function AutoRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-blue-900">
            Chargement...
          </h2>
        </div>
      </div>
    }>
      <AutoRedirectContent />
    </Suspense>
  );
}
