'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function TestAuthPage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Test d\'authentification...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📊 Session data:', { session, user: session?.user, error });
        
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error('💥 Erreur auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test d'Authentification</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">État de la session</h2>
          <div className="space-y-2">
            <p><strong>Session active:</strong> {session ? '✅ Oui' : '❌ Non'}</p>
            <p><strong>Utilisateur connecté:</strong> {user ? '✅ Oui' : '❌ Non'}</p>
            {user && (
              <>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Dernière connexion:</strong> {new Date(user.last_sign_in_at).toLocaleString()}</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Aller à la page de connexion
            </button>
            <button
              onClick={() => window.location.href = '/photo-portfolio'}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Aller au Portfolio Photo
            </button>
            {user && (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Se déconnecter
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Logs de débogage</h2>
          <p className="text-sm text-gray-600">
            Ouvrez la console du navigateur (F12) pour voir les logs détaillés.
          </p>
        </div>
      </div>
    </div>
  );
}
