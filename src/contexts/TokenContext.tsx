'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TokenContextType {
  tokens: number;
  refreshTokens: () => Promise<void>;
  isLoading: boolean;
  error?: string;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTokens = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Récupérer l'utilisateur depuis le localStorage (utilise 'user_data' comme useCustomAuth)
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        console.log('🪙 TokenContext: Aucun utilisateur trouvé dans localStorage');
        setTokens(0);
        setError('Utilisateur non connecté');
        return;
      }

      const user = JSON.parse(userData);
      console.log('🪙 TokenContext: Utilisateur trouvé:', user.email, 'ID:', user.id);
      
      const response = await fetch(`/api/user-tokens-simple?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('🪙 TokenContext: Tokens récupérés:', data.tokensRemaining);
        setTokens(data.tokensRemaining || 0);
        setError(null);
      } else {
        const errorText = await response.text();
        console.error('🪙 TokenContext: Erreur API:', response.status, response.statusText, errorText);
        setTokens(0);
        setError(`Erreur API: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('🪙 TokenContext: Erreur lors du rafraîchissement des tokens:', error);
      setTokens(0);
      setError(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTokens();
  }, []);

  // Écouter les événements de connexion/déconnexion
  useEffect(() => {
    const handleUserLogin = () => {
      console.log('🪙 TokenContext: Utilisateur connecté, rafraîchissement des tokens');
      refreshTokens();
    };

    const handleUserLogout = () => {
      console.log('🪙 TokenContext: Utilisateur déconnecté, reset des tokens');
      setTokens(0);
    };

    // Écouter les événements personnalisés de useCustomAuth
    window.addEventListener('userLoggedIn', handleUserLogin);
    window.addEventListener('userLoggedOut', handleUserLogout);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
      window.removeEventListener('userLoggedOut', handleUserLogout);
    };
  }, []);

  return (
    <TokenContext.Provider value={{ tokens, refreshTokens, isLoading, error }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokenContext() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokenContext must be used within a TokenProvider');
  }
  return context;
}