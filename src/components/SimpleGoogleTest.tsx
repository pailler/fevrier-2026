'use client';

import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function SimpleGoogleTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testGoogleAuth = async () => {
    try {
      setLoading(true);
      setResult('Test en cours...');
      
      console.log('🔍 Test de connexion Google');
      console.log('🔍 URL actuelle:', window.location.href);
      
      // Test simple de la configuration Supabase
      const { data: { session } } = await supabase.auth.getSession();
      // Log réduit pour éviter d'afficher le token en production
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Session actuelle:', { user: session?.user?.email, hasToken: !!session?.access_token });
      }
      
      // Test de la table users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      console.log('🔍 Test table users:', { users, usersError });
      
      if (session) {
        setResult('✅ Utilisateur déjà connecté: ' + session.user.email);
        return;
      }

      // Test de la connexion Google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/api/auth/callback'
        }
      });

      if (error) {
        console.error('❌ Erreur:', error);
        setResult('❌ Erreur: ' + error.message);
      } else {
        console.log('✅ Redirection vers Google...');
        setResult('✅ Redirection vers Google OAuth...');
      }
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      setResult('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Test Google OAuth Simple</h2>
      
      <button
        onClick={testGoogleAuth}
        disabled={loading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Test en cours...' : 'Tester Google OAuth'}
      </button>
      
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <strong>Résultat:</strong> {result}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>URL actuelle:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
        <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
      </div>
    </div>
  );
}
