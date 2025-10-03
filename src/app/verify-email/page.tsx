'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Token de vérification manquant');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });

        const result = await response.json();

        if (response.ok) {
          setMessage('Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter.');
        } else {
          setError(result.error || 'Erreur lors de la vérification de l\'email');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        setError('Une erreur est survenue lors de la vérification');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'email en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4 ${
            error ? 'bg-red-600' : 'bg-green-600'
          }`}>
            <span className="text-white font-bold text-xl">
              {error ? '✗' : '✓'}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {error ? 'Erreur de vérification' : 'Email vérifié !'}
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            {error ? (
              <div className="text-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                  {error}
                </div>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
                  {message}
                </div>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Se connecter maintenant
                </button>
              </div>
            )}
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}



