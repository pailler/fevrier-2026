'use client';

import { useState } from 'react';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';
import { closeUserGesturePopup, navigateUserGesturePopup, openUserGesturePopup } from '../utils/safePopupNav';

interface TtsAccessButtonProps {
  user: {
    id: string;
    email: string;
  };
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function TtsAccessButton({
  user,
  onAccessGranted,
  onAccessDenied
}: TtsAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccess = async () => {
    setIsLoading(true);
    setError(null);

    const popup = openUserGesturePopup();

    try {
      // Vérifier le solde de tokens
      const tokenService = TokenActionServiceClient.getInstance();
      const balance = await tokenService.getUserTokenBalance(user.id);

      const moduleCost = 100; // TTS coûte 100 crédits

      if (!balance || balance < moduleCost) {
        closeUserGesturePopup(popup);
        const reason = `Crédits insuffisants. Solde actuel: ${balance || 0} crédit(s). ${moduleCost} crédits requis.`;
        setError(reason);
        onAccessDenied?.(reason);
        setIsLoading(false);
        return;
      }

      // Consommer les tokens
      const consumeResult = await tokenService.checkAndConsumeTokens(
        user.id,
        'tts',
        'access',
        'Synthèse vocale IA (TTS)'
      );

      if (!consumeResult.success) {
        closeUserGesturePopup(popup);
        const reason = consumeResult.reason || 'Erreur lors de la consommation des crédits';
        setError(reason);
        onAccessDenied?.(reason);
        setIsLoading(false);
        return;
      }

      const isLocalhost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      // En local (dev), on garde l'accès direct sans token (service local)
      if (isLocalhost) {
        const localUrl = 'http://localhost:8101';
        navigateUserGesturePopup(popup, localUrl);
        onAccessGranted?.(localUrl);
        return;
      }

      // En prod, ouvrir le sous-domaine public avec token (tts.iahome.fr)
      const tokenResponse = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          moduleId: 'tts'
        })
      });

      if (!tokenResponse.ok) {
        let errorMessage = 'Erreur génération token';
        try {
          const errorData = await tokenResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // ignore
        }
        throw new Error(errorMessage);
      }

      const tokenData = await tokenResponse.json();
      if (!tokenData.token) {
        throw new Error('Token non généré par le serveur');
      }

      const ttsUrl = `https://tts.iahome.fr?token=${encodeURIComponent(tokenData.token)}`;
      navigateUserGesturePopup(popup, ttsUrl);
      onAccessGranted?.(ttsUrl);
    } catch (err) {
      closeUserGesturePopup(popup);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      onAccessDenied?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleAccess}
        disabled={isLoading}
        className="touch-manipulation w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            <span>Accès en cours...</span>
          </>
        ) : (
          <>
            <span className="mr-2">🗣️</span>
            <span>Accéder à la synthèse vocale (100 crédits)</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}
    </div>
  );
}
