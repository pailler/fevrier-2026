'use client';

import React, { useState } from 'react';
import { TokenActionServiceClient } from '../utils/tokenActionServiceClient';
import { useTokenContext } from '../contexts/TokenContext';
import { getTokenCostForModuleId, getModuleAccessCostLabel, FREE_UNLIMITED_ACCESS_LABEL } from '../utils/tokenActionService';
import { getModuleAppUrl, openModuleAppWithToken, openPendingModuleTab, buildModuleAppUrlWithToken } from '../utils/moduleAppUrl';

interface EssentialAccessButtonProps {
  user?: any;
  moduleId: string;
  moduleTitle: string;
  onAccessGranted?: (url: string) => void;
  onAccessDenied?: (reason: string) => void;
}

export default function EssentialAccessButton({ 
  user,
  moduleId,
  moduleTitle,
  onAccessGranted, 
  onAccessDenied 
}: EssentialAccessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshTokens } = useTokenContext();

  const handleAccess = async () => {
    if (!user) {
      setError('Vous devez être connecté');
      onAccessDenied?.('Non connecté');
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const pendingTab = openPendingModuleTab();

    try {
      console.log(`🪙 ${moduleTitle}: Vérification et consommation des tokens pour:`, user.email);
      
      const moduleCost = getTokenCostForModuleId(moduleId);
      if (moduleCost > 0) {
        const tokenService = TokenActionServiceClient.getInstance();
        const consumeResult = await tokenService.checkAndConsumeTokens(
          user.id,
          moduleId as any,
          'access',
          moduleTitle
        );
        
        if (!consumeResult.success) {
          console.log(`🪙 ${moduleTitle}: Échec consommation tokens:`, consumeResult.reason);
          const errorMessage = consumeResult.reason || 'Plus de crédits ? Rechargez';
          setError(errorMessage);
          onAccessDenied?.(errorMessage);
          return;
        }
        
        console.log(`🪙 ${moduleTitle}: Tokens consommés avec succès:`, consumeResult.tokensConsumed);
        console.log(`🪙 ${moduleTitle}: Tokens restants:`, consumeResult.tokensRemaining);
        
        await refreshTokens();
      }

      // Obtenir l'URL applicative
      const moduleUrl = getModuleAppUrl(moduleId);
      
      if (!moduleUrl) {
        throw new Error(`Module ${moduleId} non trouvé`);
      }
      
      // Générer un token d'accès pour tous les modules (y compris les routes internes avec token)
      const tokenResponse = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          moduleId: moduleId
        })
      });

      if (!tokenResponse.ok) {
        let errorMessage = 'Erreur génération token';
        try {
          const errorData = await tokenResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const errorText = await tokenResponse.text();
          console.error(`❌ ${moduleTitle}: Erreur génération token:`, errorText);
        }
        throw new Error(errorMessage);
      }

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.token) {
        throw new Error('Token non généré par le serveur');
      }
      
      openModuleAppWithToken(moduleId, tokenData.token, moduleUrl, pendingTab);
      onAccessGranted?.(buildModuleAppUrlWithToken(moduleId, tokenData.token, moduleUrl));
    } catch (err: any) {
      if (pendingTab && !pendingTab.closed) {
        pendingTab.close();
      }
      console.error(`❌ ${moduleTitle}: Erreur inattendue:`, err);
      const errorMessage = err?.message || 'Une erreur inattendue est survenue.';
      setError(errorMessage);
      onAccessDenied?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleAccess}
        disabled={isLoading || !user}
        className={`px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 flex items-center space-x-2
          ${isLoading || !user
            ? 'bg-gray-400 cursor-not-allowed'
            : moduleId === 'administration'
            ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
            : moduleId === 'apprendre-autrement'
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
            : moduleId === 'code-learning'
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        {isLoading ? (
          <>
            <span>⏳</span>
            <span>Ouverture...</span>
          </>
        ) : moduleId === 'administration' ? (
          <>
            <span>🏛️</span>
            <span>Accéder aux services administratifs</span>
            <span className="text-xs opacity-90">({FREE_UNLIMITED_ACCESS_LABEL})</span>
          </>
        ) : moduleId === 'apprendre-autrement' ? (
          <>
            <span>🌈</span>
            <span>Accéder à Apprendre Autrement</span>
            <span className="text-xs opacity-90">(10 crédits par accès)</span>
          </>
        ) : moduleId === 'code-learning' ? (
          <>
            <span>💻</span>
            <span>Accéder à Apprendre le Code</span>
            <span className="text-xs opacity-90">({FREE_UNLIMITED_ACCESS_LABEL})</span>
          </>
        ) : moduleId === 'reveil-intelligent' ? (
          <>
            <span>⏰</span>
            <span>Accéder au Réveil Intelligent</span>
            <span className="text-xs opacity-90">({FREE_UNLIMITED_ACCESS_LABEL})</span>
          </>
        ) : moduleId === 'vote' ? (
          <>
            <span>🗳️</span>
            <span>Accéder au Vote en ligne (10 crédits par accès)</span>
          </>
        ) : getTokenCostForModuleId(moduleId) === 0 ? (
          <>
            <span>🔧</span>
            <span>Accéder à {moduleTitle}</span>
            <span className="text-xs opacity-90">({FREE_UNLIMITED_ACCESS_LABEL})</span>
          </>
        ) : (
          <>
            <span>🔧</span>
            <span>
              Accéder à {moduleTitle} ({getModuleAccessCostLabel(moduleId)})
            </span>
          </>
        )}
      </button>

      {error && (
        <p className="text-red-500 text-sm">
          {error.includes('Rechargez') || error.includes('tokens') || error.includes('crédits') ? (
            <>
              Plus de crédits ?{' '}
              <a 
                href="https://iahome.fr/pricing2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-red-700"
              >
                rechargez
              </a>
            </>
          ) : (
            error
          )}
        </p>
      )}
    </div>
  );
}
