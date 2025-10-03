'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import WorkingSignInForm from '../../components/WorkingSignInForm';
import { useCustomAuth } from '../../hooks/useCustomAuth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading } = useCustomAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, rediriger vers l'accueil
    if (isAuthenticated && user) {
      router.push('/');
    }

    // Vérifier les erreurs dans l'URL
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
    }

    // Vérifier les messages de succès dans l'URL
    const messageParam = searchParams.get('message');
    if (messageParam) {
      setSuccess(decodeURIComponent(messageParam));
    }
  }, [isAuthenticated, user, router, searchParams]);

  const handleAuthSuccess = (user: any) => {
    if (user) {
      router.push('/');
    }
  };

  const handleAuthError = (error: any) => {
    console.error('Erreur d\'authentification:', error);
    setError('Erreur lors de la connexion. Veuillez réessayer.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vous êtes déjà connecté !
          </h2>
          <p className="text-gray-600 mb-4">
            Redirection vers la page d'accueil...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">I</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Connexion à IAhome
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous avec votre compte Google pour accéder à tous les services IAHome : applications IA, formations IA, nos conseils
          </p>
        </div>

        <div className="mt-8 space-y-6">
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

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <GoogleSignInButton
              onSuccess={handleAuthSuccess}
              onError={handleAuthError}
              className="mb-6"
            />
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <WorkingSignInForm
              onSuccess={handleAuthSuccess}
              onError={handleAuthError}
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Vous n'avez pas de compte ?{' '}
                <a href="/signup" className="text-green-600 hover:text-green-500 font-medium">
                  Créer un compte
                </a>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                En vous connectant, vous acceptez nos{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                  conditions d'utilisation
                </a>
                {' '}et notre{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                  politique de confidentialité
                </a>
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              IAhome - Plateforme d'outils IA sécurisée
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}