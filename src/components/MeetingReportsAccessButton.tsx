'use client';

import { useState } from 'react';
import { TokenActionServiceClient } from '@/utils/tokenActionServiceClient';

interface MeetingReportsAccessButtonProps {
  user: {
    id: string;
    email: string;
  } | null;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function MeetingReportsAccessButton({ 
  user, 
  onAccessGranted, 
  onAccessDenied 
}: MeetingReportsAccessButtonProps) {
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
      console.log('🪙 Meeting Reports: Vérification et consommation des tokens pour:', user.email);
      
      // Consommer les tokens pour l'accès
      const consumeResult = await tokenService.checkAndConsumeTokens(user.id, 'meeting-reports', 'access', user.email);
      
      if (!consumeResult.success) {
        console.log('🪙 Meeting Reports: Échec consommation tokens:', consumeResult.reason);
        setError(consumeResult.reason || 'Erreur lors de la consommation des tokens');
        onAccessDenied?.(consumeResult.reason || 'Erreur tokens');
        return;
      }

      console.log('🪙 Meeting Reports: Tokens consommés avec succès:', consumeResult.tokensConsumed);
      console.log('🪙 Meeting Reports: Tokens restants:', consumeResult.tokensRemaining);

      // Accès direct au sous-domaine
      const meetingReportsUrl = 'https://meeting-reports.iahome.fr';
      console.log('🔗 Meeting Reports: Accès direct à:', meetingReportsUrl);
      window.open(meetingReportsUrl, '_blank');
      
      onAccessGranted?.(meetingReportsUrl);

    } catch (tokenError) {
      console.error('🪙 Meeting Reports: Erreur lors de la consommation des tokens:', tokenError);
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
        className={`
          px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 
          flex items-center space-x-2 min-w-[200px] justify-center
          ${isLoading || !user 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg active:scale-95'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Ouverture...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>📊</span>
            <span>Accéder au Compte rendu automatique (100 tokens)</span>
          </div>
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
