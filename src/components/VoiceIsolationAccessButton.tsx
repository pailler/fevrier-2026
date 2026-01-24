'use client';

import { useState } from 'react';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';

interface VoiceIsolationAccessButtonProps {
  user: {
    id: string;
    email: string;
  };
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function VoiceIsolationAccessButton({
  user,
  onAccessGranted,
  onAccessDenied
}: VoiceIsolationAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccess = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Vérifier le solde de tokens
      const tokenService = TokenActionServiceClient.getInstance();
      const balance = await tokenService.getUserTokenBalance(user.id);

      const moduleCost = 100; // Voice Isolation coûte 100 tokens

      if (!balance || balance < moduleCost) {
        const reason = `Tokens insuffisants. Solde actuel: ${balance || 0} token(s). ${moduleCost} tokens requis.`;
        setError(reason);
        onAccessDenied?.(reason);
        setIsLoading(false);
        return;
      }

      // Consommer les tokens
      const consumeResult = await tokenService.checkAndConsumeTokens(
        user.id,
        'voice-isolation',
        'access',
        'Isolation Vocale par IA'
      );

      if (!consumeResult.success) {
        const reason = consumeResult.reason || 'Erreur lors de la consommation des tokens';
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
        const localUrl = 'http://localhost:8100';
        window.open(localUrl, '_blank', 'noopener,noreferrer');
        onAccessGranted?.(localUrl);
        return;
      }

      // En prod, ouvrir le sous-domaine public avec token (et non une route locale /voice-isolation)
      const tokenResponse = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          moduleId: 'voice-isolation'
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

      const voiceIsolationUrl = `https://voice-isolation.iahome.fr?token=${encodeURIComponent(tokenData.token)}`;
      window.open(voiceIsolationUrl, '_blank', 'noopener,noreferrer');
      onAccessGranted?.(voiceIsolationUrl);
    } catch (err) {
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
        onClick={handleAccess}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            <span>Accès en cours...</span>
          </>
        ) : (
          <>
            <span className="mr-2">🎤</span>
            <span>Accéder à l'Isolation Vocale (100 tokens)</span>
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
