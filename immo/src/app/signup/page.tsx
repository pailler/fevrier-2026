'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import WorkingSignUpForm from '../../components/WorkingSignUpForm';
import { useCustomAuth } from '../../hooks/useCustomAuth';

function SignUpContent() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useCustomAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, rediriger vers l'accueil
    if (isAuthenticated && user) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const handleAuthSuccess = (user: any) => {
    if (user) {
      setSuccess('Compte créé et connecté avec succès ! Redirection en cours...');
      // Rediriger vers la page de succès avec les données utilisateur
      setTimeout(() => {
        const userData = encodeURIComponent(JSON.stringify(user));
        router.push(`/signup-success?user=${userData}`);
      }, 2000);
    }
  };

  const handleAuthError = (error: any) => {
    console.error('Erreur lors de la création du compte:', error);
    setError('Erreur lors de la création du compte. Veuillez réessayer.');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">+</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Créer un compte IAhome
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez notre plateforme d'outils IA et accédez à tous nos services
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
            <WorkingSignUpForm
              onSuccess={handleAuthSuccess}
              onError={handleAuthError}
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  Se connecter
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

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
