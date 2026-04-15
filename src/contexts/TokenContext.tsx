'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

  const refreshTokens = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Récupérer l'utilisateur depuis le localStorage (utilise 'user_data' comme useCustomAuth)
      // Vérifier que localStorage est disponible (côté client uniquement)
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('🪙 TokenContext: localStorage non disponible');
        setTokens(0);
        return;
      }
      
      const userData = localStorage.getItem('user_data');
      if (!userData) {
        // Ne pas logger en erreur si l'utilisateur n'est simplement pas connecté
        // console.log('🪙 TokenContext: Aucun utilisateur trouvé dans localStorage');
        setTokens(0);
        setError(null); // Ne pas afficher d'erreur si l'utilisateur n'est pas connecté
        return;
      }

      const user = JSON.parse(userData);
      console.log('🪙 TokenContext: Utilisateur trouvé:', user.email, 'ID:', user.id);
      console.log('🪙 TokenContext: Type d\'ID:', typeof user.id, 'Longueur:', user.id?.length);
      
      // L'API user-tokens-simple accepte soit l'UUID soit l'email
      // Si user.id est un UUID Supabase, l'API le convertira en ID de profil si nécessaire
      const userIdParam = user.id || user.email;
      console.log('🪙 TokenContext: Paramètre userId pour API:', userIdParam);
      
      const response = await fetch(`/api/user-tokens-simple?userId=${encodeURIComponent(userIdParam)}`);
      console.log('🪙 TokenContext: Réponse API status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🪙 TokenContext: Tokens récupérés:', data.tokensRemaining);
        console.log('🪙 TokenContext: Données complètes:', { 
          tokens: data.tokens, 
          tokensRemaining: data.tokensRemaining,
          packageName: data.packageName,
          isActive: data.isActive 
        });
        setTokens(data.tokensRemaining || 0);
        setError(null);
      } else if (response.status === 401) {
        console.warn('🪙 TokenContext: 401 non autorisé, nettoyage stockage client...');
        // Nettoyer le localStorage pour éviter les tentatives répétées
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('session_start_time');
        setTokens(0);
        setError(null); // Ne pas afficher d'erreur, c'est normal après déconnexion
      } else {
        const errorText = await response.text();
        const looksLikeHtml =
          errorText.trimStart().startsWith('<!DOCTYPE') ||
          errorText.trimStart().startsWith('<html') ||
          errorText.includes('__NEXT_DATA__');
        if (looksLikeHtml) {
          console.error(
            '🪙 TokenContext: Erreur API',
            response.status,
            '— le serveur a renvoyé une page HTML (souvent cache .next corrompu : arrêter le dev, supprimer le dossier .next, relancer npm run dev).'
          );
          setError(`Erreur serveur (${response.status}). Si vous êtes en dev local, supprimez le dossier .next puis relancez le serveur.`);
        } else {
          console.error('🪙 TokenContext: Erreur API:', response.status, response.statusText, errorText);
          setError(`Erreur API: ${response.status} ${response.statusText}`);
        }
        setTokens(0);
      }
    } catch (error) {
      console.error('🪙 TokenContext: Erreur lors du rafraîchissement des tokens:', error);
      setTokens(0);
      setError(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTokens();
  }, [refreshTokens]); // refreshTokens est maintenant stable grâce à useCallback

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
  }, [refreshTokens]); // refreshTokens est maintenant stable grâce à useCallback

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