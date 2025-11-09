'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '../hooks/useCustomAuth';

interface WorkingSignInFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  className?: string;
  redirectUrl?: string;
}

export default function WorkingSignInForm({
  onSuccess,
  onError,
  className = "",
  redirectUrl
}: WorkingSignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn } = useCustomAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Utiliser notre système d'authentification personnalisé qui fonctionne
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

      const result = await response.json();

      if (!response.ok) {
        // Si c'est un compte OAuth qui n'a pas de mot de passe
        if (result.oauth_account && result.needs_password) {
          const errorMessage = 'Ce compte a été créé avec Google. Veuillez vous connecter avec le bouton "Se connecter avec Google" ci-dessus.';
          console.error('Erreur de connexion:', errorMessage);
          setError(errorMessage);
          onError?.(new Error(errorMessage));
        } else {
          const errorMessage = result.error || 'Erreur lors de la connexion';
          console.error('Erreur de connexion:', errorMessage);
          setError(errorMessage);
          onError?.(new Error(errorMessage));
        }
        return;
      }

      if (result.token) {
        // Utiliser notre hook personnalisé pour gérer l'état d'authentification
        signIn(result.user, result.token);
        
        // Rediriger vers la page d'origine ou la page d'accueil par défaut
        const redirectTo = redirectUrl ? decodeURIComponent(redirectUrl) : '/';
        router.push(redirectTo);
      }

      console.log('Connexion réussie:', result.user);
      onSuccess?.(result.user);
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      setError('Une erreur est survenue lors de la connexion');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto bg-white p-8 rounded-lg shadow-md ${className}`}>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Connexion
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

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

        <div className="text-center space-y-2">
          <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 block">
            Mot de passe oublié ?
          </a>
          <a href="/signup" className="text-sm text-blue-600 hover:text-blue-500 block">
            Pas encore de compte ? S'inscrire
          </a>
        </div>
      </form>
    </div>
  );
}
