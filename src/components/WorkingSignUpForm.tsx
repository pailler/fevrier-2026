'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '../hooks/useCustomAuth';

interface WorkingSignUpFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

export default function WorkingSignUpForm({
  onSuccess,
  onError,
  className = ""
}: WorkingSignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { signIn } = useCustomAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation côté client
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      // Utiliser notre système d'authentification personnalisé qui fonctionne
      const response = await fetch('/api/auth/signup-alternative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Erreur lors de l\'inscription');
        onError?.(new Error(result.error));
        return;
      }

      if (result.success) {
        // Connecter automatiquement l'utilisateur après la création de compte
        setError(null);
        setSuccess('Compte créé avec succès ! Connexion automatique...');
        
        // Générer un token simple pour la connexion automatique
        const autoToken = btoa(JSON.stringify({
          userId: result.user.id,
          email: result.user.email,
          timestamp: Date.now()
        }));
        
        // Connecter l'utilisateur automatiquement
        signIn(result.user, autoToken);
        
        // Rediriger vers la page de succès avec les données utilisateur
        setTimeout(() => {
          const userData = encodeURIComponent(JSON.stringify(result.user));
          router.push(`/signup-success?user=${userData}`);
        }, 2000);
      }

      console.log('Inscription réussie:', result.user);
      onSuccess?.(result.user);
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      setError('Une erreur est survenue lors de l\'inscription');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto bg-white p-8 rounded-lg shadow-md ${className}`}>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Créer un compte
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Nom complet
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Votre nom complet"
          />
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
            placeholder="Au moins 6 caractères"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirmez votre mot de passe"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Création du compte...
            </div>
          ) : (
            'Créer mon compte'
          )}
        </button>

        <div className="text-center">
          <a href="/login" className="text-sm text-blue-600 hover:text-blue-500">
            Déjà un compte ? Se connecter
          </a>
        </div>
      </form>
    </div>
  );
}

