'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { REVEIL_LANDING_URL } from '@/utils/productLandingHosts';
import { consumeStashedModuleToken } from '@/utils/moduleAppUrl';

/**
 * App Réveil : https://iahome.fr/reveil?token=...
 * Landing : https://reveil.iahome.fr
 * Embed : /reveil/embed → :7891
 */
export default function ReveilAppPage() {
  const router = useRouter();
  const [tokenValidated, setTokenValidated] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const token =
        consumeStashedModuleToken('reveil-intelligent') ||
        consumeStashedModuleToken('reveil') ||
        urlParams.get('token');

      if (!token) {
        window.location.replace(`${REVEIL_LANDING_URL}/`);
        return;
      }

      try {
        const response = await fetch('/api/validate-internal-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, moduleId: 'reveil-intelligent' }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setTokenError(
            (errorData as { error?: string }).error ||
              'Token invalide ou expiré. Ouvrez Réveil Intelligent depuis votre espace IAHome.'
          );
          return;
        }

        setEmbedSrc(`/reveil/embed?token=${encodeURIComponent(token)}`);
        setTokenValidated(true);
        window.history.replaceState(
          {},
          document.title,
          `${window.location.pathname}?token=${encodeURIComponent(token)}`
        );
      } catch {
        setTokenError('Erreur lors de la validation du token. Veuillez réessayer.');
      }
    };

    void validateToken();
  }, []);

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium mb-2">Accès refusé</p>
            <p className="text-red-600 mb-4">{tokenError}</p>
            <button
              type="button"
              onClick={() => router.push('/account')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Retour aux modules
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValidated || !embedSrc) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4" />
          <p className="text-gray-600">Vérification de l&apos;accès Réveil Intelligent…</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      title="Réveil Intelligent IAHome"
      src={embedSrc}
      className="fixed inset-0 w-full h-full border-0 bg-white"
      allow="clipboard-write; fullscreen; notifications"
    />
  );
}
