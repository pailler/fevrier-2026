'use client';

import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function GoogleSignInDebug() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('Début de la connexion Google...');
      
      ;
      console.log('🔍 DEBUG: URL actuelle:', window.location.href);
      console.log('🔍 DEBUG: Origin:', window.location.origin);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`
        }
      });

      console.log('🔍 DEBUG: Réponse Supabase:', { data, error });

      if (error) {
        console.error('❌ Erreur de connexion Google:', error);
        setError(`Erreur: ${error.message}`);
        setDebugInfo(`Erreur: ${error.message}`);
      } else {
        ;
        setDebugInfo('Redirection vers Google OAuth...');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion Google:', error);
      setError(`Erreur: ${error.message}`);
      setDebugInfo(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Debug Google OAuth</h3>
      
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 
        rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 hover:shadow-md mb-4"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
            Test en cours...
          </div>
        ) : (
          'Tester Google OAuth'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {debugInfo && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          <strong>Debug:</strong> {debugInfo}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600">
        <p><strong>URL actuelle:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
        <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
        <p><strong>Supabase URL:</strong> https://xemtoyzcihmncbrlsmhr.supabase.co</p>
      </div>
    </div>
  );
}
