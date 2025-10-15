'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DebugSignInFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

export default function DebugSignInForm({
  onSuccess,
  onError,
  className = ""
}: DebugSignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log('🔍 Tentative de connexion avec:', { email, password: '***' });
      
      const response = await fetch('/api/auth/signin-alternative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      console.log('📡 Réponse reçue:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      const result = await response.json();
      console.log('📊 Données de réponse:', result);

      // Stocker les informations de debug
      setDebugInfo({
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        result: result
      });

      if (!response.ok) {
        const errorMessage = result.error || 'Erreur lors de la connexion';
        console.error('❌ Erreur de connexion:', errorMessage);
        setError(errorMessage);
        onError?.(new Error(errorMessage));
        return;
      }

      if (result.token) {
        ;
        
        // Stocker le token et les données utilisateur
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
        
        console.log('💾 Token stocké dans localStorage');
        console.log('👤 Données utilisateur:', result.user);
        
        // Rediriger vers la page d'accueil
        router.push('/');
      }

      console.log('🎉 Connexion réussie:', result.user);
      onSuccess?.(result.user);
    } catch (error: any) {
      console.error('💥 Erreur inattendue lors de la connexion:', error);
      setError('Une erreur est survenue lors de la connexion');
      setDebugInfo({
        error: error.message,
        stack: error.stack
      });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo@example.com');
    setPassword('Password123!');
  };

  return (
    <div className={`max-w-md mx-auto bg-white p-8 rounded-lg shadow-md ${className}`}>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        🔧 Connexion Debug
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <strong>❌ Erreur:</strong> {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <button
            type="button"
            onClick={fillDemoAccount}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            🚀 Utiliser le compte démo (demo@example.com)
          </button>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Votre mot de passe"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connexion en cours...
            </div>
          ) : (
            'Se connecter'
          )}
        </button>

        {debugInfo && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">🔍 Informations de Debug</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Statut:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  debugInfo.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugInfo.status} {debugInfo.ok ? 'SUCCESS' : 'ERROR'}
                </span>
              </div>
              
              {debugInfo.result?.token && (
                <div>
                  <span className="font-medium">Token:</span>
                  <code className="ml-2 text-xs bg-gray-100 px-1 rounded">
                    {debugInfo.result.token.substring(0, 30)}...
                  </code>
                </div>
              )}
              
              {debugInfo.result?.user && (
                <div>
                  <span className="font-medium">Utilisateur:</span>
                  <span className="ml-2 text-gray-600">
                    {debugInfo.result.user.full_name} ({debugInfo.result.user.email})
                  </span>
                </div>
              )}
              
              {debugInfo.error && (
                <div>
                  <span className="font-medium text-red-600">Erreur:</span>
                  <span className="ml-2 text-red-600">{debugInfo.error}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center space-y-2">
          <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 block">
            Mot de passe oublié ?
          </a>
          <a href="/signup" className="text-sm text-blue-600 hover:text-blue-500 block">
            Pas encore de compte ? S'inscrire
          </a>
          <a href="/debug-auth" className="text-sm text-purple-600 hover:text-purple-500 block">
            🔧 Page de diagnostic complète
          </a>
        </div>
      </form>
    </div>
  );
}

