'use client';

import React, { useState } from 'react';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';

interface QRCodeAccessButtonProps {
  user?: any;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function QRCodeAccessButton({ 
  user, 
  onAccessGranted, 
  onAccessDenied 
}: QRCodeAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenService = TokenActionServiceClient.getInstance();

  const handleAccess = async () => {
    if (!user) {
      setError('Vous devez être connecté');
      onAccessDenied?.('Non connecté');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🪙 QR Codes: Vérification et consommation des tokens pour:', user.email);
      
      // Consommer les tokens pour l'accès
      const consumeResult = await tokenService.checkAndConsumeTokens(user.id, 'qrcodes', 'access', user.email);
      
      if (!consumeResult.success) {
        console.log('🪙 QR Codes: Échec consommation tokens:', consumeResult.reason);
        setError(consumeResult.reason || 'Erreur lors de la consommation des tokens');
        onAccessDenied?.(consumeResult.reason || 'Erreur tokens');
        return;
      }

      console.log('🪙 QR Codes: Tokens consommés avec succès:', consumeResult.tokensConsumed);
      console.log('🪙 QR Codes: Tokens restants:', consumeResult.tokensRemaining);

      // Incrémenter le compteur d'accès dans user_applications
      try {
        const incrementResponse = await fetch('/api/increment-module-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email,
            moduleId: 'qrcodes'
          })
        });

        if (incrementResponse.ok) {
          const incrementData = await incrementResponse.json();
          console.log('✅ QR Codes: Compteur incrémenté:', incrementData.usage_count);
        } else {
          console.warn('⚠️ QR Codes: Erreur incrémentation compteur, continuons...');
        }
      } catch (incrementError) {
        console.warn('⚠️ QR Codes: Erreur incrémentation compteur:', incrementError);
      }

      // Accès direct au sous-domaine
      const qrcodesUrl = 'https://qrcodes.iahome.fr';
      console.log('🔗 QR Codes: Accès direct à:', qrcodesUrl);
      window.open(qrcodesUrl, '_blank');
      
      onAccessGranted?.(qrcodesUrl);

    } catch (tokenError) {
      console.error('🪙 QR Codes: Erreur lors de la consommation des tokens:', tokenError);
      setError('Erreur lors de la consommation des tokens. Veuillez réessayer.');
      onAccessDenied?.('Erreur consommation tokens');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleAccess}
        disabled={isLoading || !user}
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          isLoading || !user
            ? 'bg-gray-400 cursor-not-allowed text-gray-600'
            : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Ouverture...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>📱</span>
            <span>Accéder aux QR Codes (100 tokens)</span>
          </div>
        )}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
      
      {!user && (
        <div className="text-yellow-600 text-sm text-center max-w-xs">
          Connectez-vous pour accéder aux QR Codes
        </div>
      )}
    </div>
  );
}