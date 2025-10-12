'use client';
import { useState, useEffect, useCallback } from 'react';

interface TokenBalanceHook {
  tokens: number | null;
  loading: boolean;
  error: string | null;
  refreshTokens: () => Promise<void>;
  consumeTokens: (amount: number) => Promise<boolean>;
}

export function useTokenBalance(userId: string | null): TokenBalanceHook {
  const [tokens, setTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenBalance = useCallback(async () => {
    if (!userId) {
      setTokens(0);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/user-tokens-simple?userId=${userId}`);
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
  }, [userId]);

  const refreshTokens = useCallback(async () => {
    setLoading(true);
    await fetchTokenBalance();
  }, [fetchTokenBalance]);

  const consumeTokens = useCallback(async (amount: number): Promise<boolean> => {
    if (!userId || !tokens || tokens < amount) {
      return false;
    }

    try {
      // Mettre à jour localement immédiatement pour une meilleure UX
      setTokens(prev => prev ? prev - amount : 0);
      
      // Rafraîchir depuis le serveur pour confirmer
      setTimeout(() => {
        fetchTokenBalance();
      }, 1000);

      return true;
    } catch (err) {
      console.error('Erreur lors de la consommation de tokens:', err);
      // Restaurer la valeur précédente en cas d'erreur
      fetchTokenBalance();
      return false;
    }
  }, [userId, tokens, fetchTokenBalance]);

  useEffect(() => {
    fetchTokenBalance();
  }, [fetchTokenBalance]);

  return {
    tokens,
    loading,
    error,
    refreshTokens,
    consumeTokens
  };
}
