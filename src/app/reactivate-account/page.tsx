'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ReactivateAccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');

    if (!emailParam || !tokenParam) {
      setError('Paramètres manquants dans l\'URL');
      setLoading(false);
      return;
    }

    setEmail(emailParam);

    // Réactiver automatiquement le compte
    const reactivateAccount = async () => {
      try {
        const response = await fetch('/api/reactivate-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: emailParam,
            token: tokenParam
          })
        });

        const data = await response.json();

        if (data.success) {
          setSuccess(true);
          // Rediriger vers la page de connexion après 3 secondes
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setError(data.error || 'Erreur lors de la réactivation');
        }
      } catch (err) {
        setError('Erreur lors de la réactivation du compte');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    reactivateAccount();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Réactivation de votre compte en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Compte réactivé !</h1>
            <p className="text-gray-600 mb-6">
              Votre compte a été réactivé avec succès. Vous allez être redirigé vers la page de connexion.
            </p>
            <a
              href="/login"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Aller à la page de connexion
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de réactivation</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Une erreur est survenue lors de la réactivation de votre compte.'}
          </p>
          {email && (
            <p className="text-sm text-gray-500 mb-6">
              Email: {email}
            </p>
          )}
          <div className="space-y-3">
            <a
              href="/login"
              className="block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Aller à la page de connexion
            </a>
            <a
              href="/contact"
              className="block bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Contacter le support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
