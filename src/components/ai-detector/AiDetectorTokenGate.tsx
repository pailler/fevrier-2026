'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { DETECTEUR_IA_LANDING_URL } from '@/utils/productLandingHosts';
import { consumeStashedModuleToken } from '@/utils/moduleAppUrl';

/**
 * Passerelle token : https://iahome.fr/ai-detector?token=…
 * Landing SEO : https://detecteur-ia.iahome.fr
 */
export default function AiDetectorTokenGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [tokenValidated, setTokenValidated] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const token =
        consumeStashedModuleToken('ai-detector') ||
        consumeStashedModuleToken('ia-generator') ||
        urlParams.get('token');

      if (!token) {
        window.location.replace(`${DETECTEUR_IA_LANDING_URL}/`);
        return;
      }

      try {
        const response = await fetch('/api/validate-internal-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, moduleId: 'ai-detector' }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setTokenError(
            (errorData as { error?: string }).error ||
              'Token invalide ou expiré. Ouvrez le Détecteur IA depuis votre espace IAHome.'
          );
          return;
        }

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium mb-2">Accès refusé</p>
            <p className="text-red-600 mb-4">{tokenError}</p>
            <button
              type="button"
              onClick={() => router.push('/account')}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700"
            >
              Retour aux modules
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValidated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4" />
          <p className="text-gray-600">Vérification de l&apos;accès Détecteur IA…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
