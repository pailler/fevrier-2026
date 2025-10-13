'use client';
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';

interface TokenContextType {
  tokens: number | null;
  loading: boolean;
  error: string | null;
  refreshTokens: () => Promise<void>;
  consumeTokens: (amount: number) => Promise<boolean>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

interface TokenProviderProps {
  children: ReactNode;
}

export function TokenProvider({ children }: TokenProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const [tokens, setTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const refreshTokens = async () => {
    if (!isClient) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer l'utilisateur depuis localStorage
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        setTokens(0);
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      const response = await fetch(`/api/user-tokens-simple?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setTokens(data.tokens || 0);
      } else {
        setError(data.error || 'Erreur lors du chargement des tokens');
        setTokens(0);
      }
    } catch (err) {
      console.error('Erreur lors du chargement du solde de tokens:', err);
      setError('Erreur de connexion');
      setTokens(0);
    } finally {
      setLoading(false);
    }
  };

  const consumeTokens = async (amount: number): Promise<boolean> => {
    if (!isClient || !tokens || tokens < amount) {
      return false;
    }

    try {
      // Mettre à jour localement immédiatement pour une meilleure UX
      setTokens(prev => prev ? prev - amount : 0);
      
      // Rafraîchir depuis le serveur pour confirmer
      setTimeout(() => {
        refreshTokens();
      }, 1000);

      return true;
    } catch (err) {
      console.error('Erreur lors de la consommation de tokens:', err);
      // Restaurer la valeur précédente en cas d'erreur
      refreshTokens();
      return false;
    }
  };

  useEffect(() => {
    if (isClient) {
      refreshTokens();
    }
  }, [isClient]);

  const contextValue: TokenContextType = {
    tokens,
    loading,
    error,
    refreshTokens,
    consumeTokens
  };

  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokenContext(): TokenContextType {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokenContext must be used within a TokenProvider');
  }
  return context;
}
