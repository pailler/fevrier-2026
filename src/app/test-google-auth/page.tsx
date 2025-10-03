'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import GoogleSignInButton from '../../components/GoogleSignInButton';

export default function TestGoogleAuthPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier la session actuelle
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          setError(error.message);
        } else {
          setSession(session);
        }
      } catch (err: any) {
        console.error('Erreur:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Changement de session:', event, session);
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
        setError(error.message);
      } else {
        setSession(null);
        setError(null);
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message);
    }
  };

  const handleGoogleError = (error: any) => {
    console.error('Erreur Google OAuth:', error);
    setError(`Erreur Google OAuth: ${error.message}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Test Google OAuth</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        {session ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <h2 className="font-bold">✅ Connecté avec succès!</h2>
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>Nom:</strong> {session.user.user_metadata?.full_name || 'Non disponible'}</p>
              <p><strong>ID:</strong> {session.user.id}</p>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Se déconnecter
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              <p>Non connecté. Cliquez sur le bouton ci-dessous pour vous connecter avec Google.</p>
            </div>
            
            <GoogleSignInButton
              onError={handleGoogleError}
              className="w-full"
            />
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Informations de débogage:</h3>
          <p><strong>URL actuelle:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
          <p><strong>Callback URL:</strong> {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}