'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function TestAuthPhotoPage() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const testAuth = async () => {
    if (!user || !session) {
      setTestResult('Aucun utilisateur connecté');
      return;
    }

    try {
      // Test 1: Vérifier le token avec Supabase
      const { data: { user: verifiedUser }, error: authError } = await supabase.auth.getUser(session.access_token);
      
      setTestResult(`
Test d'authentification:
- Utilisateur: ${user.email}
- User ID: ${user.id}
- Token présent: ${!!session.access_token}
- Token longueur: ${session.access_token?.length}
- Vérification token: ${authError ? 'ERREUR: ' + authError.message : 'SUCCÈS'}
- User vérifié: ${verifiedUser?.email || 'N/A'}
      `);

      // Test 2: Tester l'API photo-portfolio
      const formData = new FormData();
      formData.append('file', new File(['test'], 'test.txt', { type: 'text/plain' }));
      formData.append('userId', user.id);

      const response = await fetch('/api/photo-portfolio/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      const result = await response.text();
      setTestResult(prev => prev + `\n\nTest API:\n- Status: ${response.status}\n- Réponse: ${result}`);

    } catch (error) {
      setTestResult(prev => prev + `\n\nErreur: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Authentification Photo</h1>
      
      <div className="mb-4">
        <p><strong>Utilisateur:</strong> {user?.email || 'Non connecté'}</p>
        <p><strong>Session:</strong> {session ? 'Active' : 'Inactive'}</p>
        <p><strong>Token:</strong> {session?.access_token ? 'Présent' : 'Manquant'}</p>
      </div>

      <button 
        onClick={testAuth}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Tester l'authentification
      </button>

      <div className="mt-4">
        <h3 className="font-bold">Résultat:</h3>
        <pre className="bg-gray-100 p-4 rounded mt-2 whitespace-pre-wrap">
          {testResult}
        </pre>
      </div>
    </div>
  );
}
