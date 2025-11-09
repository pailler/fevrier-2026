'use client';

import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface ClassicSignInFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

export default function ClassicSignInForm({ 
  onSuccess, 
  onError, 
  className = "" 
}: ClassicSignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Utiliser l'API alternative pour la connexion
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
          setError('Ce compte a été créé avec Google. Veuillez vous connecter avec le bouton "Se connecter avec Google" ci-dessus.');
        } else {
          setError(result.error || 'Erreur lors de la connexion');
        }
        onError?.(new Error(result.error || 'Erreur lors de la connexion'));
        return;
      }

      // Stocker le token dans le localStorage
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
      }

      console.log('Connexion réussie:', result.user);
      onSuccess?.(result.user);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Une erreur est survenue lors de la connexion');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
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

      <div className="text-center">
        <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
          Mot de passe oublié ?
        </a>
      </div>
    </form>
  );
}
