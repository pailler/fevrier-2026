'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TokenContextType {
  tokens: number;
  refreshTokens: () => Promise<void>;
  isLoading: boolean;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshTokens = async () => {
    setIsLoading(true);
    try {
      // Récupérer l'utilisateur depuis le localStorage ou sessionStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        setTokens(0);
        return;
      }

      const user = JSON.parse(userData);
      
      const response = await fetch(`/api/user-tokens-simple?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokensRemaining || 0);
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTokens();
  }, []);

  return (
    <TokenContext.Provider value={{ tokens, refreshTokens, isLoading }}>
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