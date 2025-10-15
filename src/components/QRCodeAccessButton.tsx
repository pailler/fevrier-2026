'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';

interface QRCodeAccessButtonProps {
  user: any;
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
  const router = useRouter();

  ;

  const handleAccess = async () => {
    if (!user) {
      setError('Vous devez être connecté');
      onAccessDenied?.('Non connecté');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 🪙 NOUVELLE VÉRIFICATION ET CONSOMMATION : Vérifier et consommer les tokens
      console.log('🪙 QR Codes: Vérification et consommation des tokens pour:', user.email);
      const tokenService = TokenActionServiceClient.getInstance();
      
      try {
        // Consommer 1 token pour l'accès aux QR Codes
        const consumeResult = await tokenService.checkAndConsumeTokens(
          user.id,
          'qrcodes',
          'access',
          'QR Codes'
        );
        
        if (!consumeResult.success) {
          console.log('🪙 QR Codes: Échec consommation tokens:', consumeResult.reason);
          setError(consumeResult.reason || 'Erreur lors de la consommation des tokens');
          onAccessDenied?.(consumeResult.reason || 'Erreur tokens');
          return;
        }
        
        console.log('🪙 QR Codes: Tokens consommés avec succès:', consumeResult.tokensConsumed);
        console.log('🪙 QR Codes: Tokens restants:', consumeResult.tokensRemaining);
        
      } catch (tokenError) {
        console.error('🪙 QR Codes: Erreur lors de la consommation des tokens:', tokenError);
        setError('Erreur lors de la consommation des tokens. Veuillez réessayer.');
        onAccessDenied?.('Erreur consommation tokens');
        return;
      }

      // 1. Incrémenter le compteur d'accès
      ;
      const incrementResponse = await fetch('/api/increment-module-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          moduleId: 'qrcodes'
        })
      });
      
      if (incrementResponse.ok) {
        const incrementData = await incrementResponse.json();
        console.log('✅ QR Codes: Compteur incrémenté:', incrementData.usage_count, '/', incrementData.max_usage);
      } else {
        const errorData = await incrementResponse.json().catch(() => ({}));
        if (incrementResponse.status === 403 && errorData.error === 'Quota dépassé') {
          ;
          setError('Quota d\'utilisation dépassé. Contactez l\'administrateur.');
          onAccessDenied?.('Quota dépassé');
          return;
        }
        console.log('⚠️ QR Codes: Erreur incrémentation compteur, continuons...');
      }
      
      // 2. Ouvrir QR Codes dans un nouvel onglet
      console.log('🔗 QR Codes: Ouverture dans un nouvel onglet...');
      const qrUrl = 'https://qrcodes.iahome.fr';
      window.open(qrUrl, '_blank');
      ;
      
      // Ne pas appeler onAccessGranted pour éviter la double ouverture

    } catch (error) {
      console.error('❌ QR Codes: Erreur:', error);
      setError('Erreur lors de l\'ouverture des QR codes');
      onAccessDenied?.('Erreur ouverture QR codes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleAccess}
        disabled={isLoading || !user}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isLoading || !user
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Ouverture...</span>
          </div>
        ) : (
          '📱 Accéder aux QR Codes (10 tokens)'
        )}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}
