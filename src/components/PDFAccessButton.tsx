'use client';

import { useState } from 'react';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';

interface PDFAccessButtonProps {
  user: any;
  onAccessGranted: (url: string) => void;
  onAccessDenied: (reason: string) => void;
}

export default function PDFAccessButton({ user, onAccessGranted, onAccessDenied }: PDFAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccess = async () => {
    if (!user) {
      setError('Vous devez être connecté');
      onAccessDenied('Utilisateur non connecté');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 🪙 NOUVELLE VÉRIFICATION ET CONSOMMATION : Vérifier et consommer les tokens
      console.log('🪙 PDF: Vérification et consommation des tokens pour:', user.email);
      const tokenService = TokenActionServiceClient.getInstance();
      
      try {
        // Consommer 1 token pour l'accès à PDF+
        const consumeResult = await tokenService.checkAndConsumeTokens(
          user.id,
          'pdf',
          'access',
          'PDF+'
        );
        
        if (!consumeResult.success) {
          console.log('🪙 PDF: Échec consommation tokens:', consumeResult.reason);
          setError(consumeResult.reason || 'Erreur lors de la consommation des tokens');
          onAccessDenied(consumeResult.reason || 'Erreur tokens');
          return;
        }
        
        console.log('🪙 PDF: Tokens consommés avec succès:', consumeResult.tokensConsumed);
        console.log('🪙 PDF: Tokens restants:', consumeResult.tokensRemaining);
        
      } catch (tokenError) {
        console.error('🪙 PDF: Erreur lors de la consommation des tokens:', tokenError);
        setError('Erreur lors de la consommation des tokens. Veuillez réessayer.');
        onAccessDenied('Erreur consommation tokens');
        return;
      }

      console.log('📄 PDF+: Début de la procédure d\'accès...');
      
      // 1. Incrémenter le compteur d'accès
      ;
      const incrementResponse = await fetch('/api/increment-module-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          moduleId: 'pdf'
        })
      });
      
      if (incrementResponse.ok) {
        const incrementData = await incrementResponse.json();
        console.log('✅ PDF+: Compteur incrémenté:', incrementData.usage_count, '/', incrementData.max_usage);
      } else {
        const errorData = await incrementResponse.json().catch(() => ({}));
        if (incrementResponse.status === 403 && errorData.error === 'Quota dépassé') {
          ;
          setError(errorData.message || 'Quota d\'utilisation dépassé. Contactez l\'administrateur.');
          onAccessDenied('Quota d\'utilisation dépassé. Contactez l\'administrateur.');
          return;
        }
        console.log('⚠️ PDF+: Erreur incrémentation compteur, continuons...');
      }
      
      // 2. Ouvrir PDF+ dans un nouvel onglet
      console.log('🔗 PDF+: Ouverture dans un nouvel onglet...');
      const pdfUrl = 'https://pdf.iahome.fr';
      window.open(pdfUrl, '_blank');
      ;
      
      // Ne pas appeler onAccessGranted pour éviter la double ouverture
      
    } catch (error) {
      console.error('❌ PDF+: ERREUR GÉNÉRALE:', error);
      setError('Erreur lors de l\'ouverture de PDF+. Veuillez réessayer.');
      onAccessDenied('Erreur lors de l\'ouverture de PDF+. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleAccess}
        disabled={isLoading}
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg ${
          isLoading
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Chargement...</span>
          </div>
        ) : (
          '📄 Accéder à PDF+ (10 tokens)'
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
