'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PSITRANSFER_LANDING_URL } from '@/utils/productLandingHosts';

/** App PsiTransfer : iahome.fr/psitransfer?token= (landing → psitransfer.iahome.fr). */
export default function PsiTransferAppPage() {
  const router = useRouter();
  const [tokenValidated, setTokenValidated] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        window.location.replace(`${PSITRANSFER_LANDING_URL}/`);
        return;
      }

      try {
        const response = await fetch('/api/validate-internal-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, moduleId: 'psitransfer' }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setTokenError(
            (errorData as { error?: string }).error ||
              'Token invalide ou expiré. Ouvrez PsiTransfer depuis votre espace IAHome.'
          );
          return;
        }

        window.history.replaceState({}, document.title, window.location.pathname);
        setEmbedSrc(`/psitransfer/embed?token=${encodeURIComponent(token)}`);
        setTokenValidated(true);
      } catch {
        setTokenError('Erreur lors de la validation du token. Veuillez réessayer.');
      }
    };

    validateToken();
  }, []);

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium mb-2">Accès refusé</p>
            <p className="text-red-600 mb-4">{tokenError}</p>
            <button
              type="button"
              onClick={() => router.push('/account')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" />
          <p className="text-gray-600">Vérification de l&apos;accès PsiTransfer…</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      title="PsiTransfer IAHome"
      src={embedSrc}
      className="fixed inset-0 w-full h-full border-0 bg-white"
      allow="clipboard-write; fullscreen"
    />
  );
}
