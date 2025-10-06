'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export function useCustomAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Ne pas exécuter côté serveur
    if (!isClient) return;

    // Vérifier l'état d'authentification au chargement
    const checkAuthState = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 useCustomAuth - Vérification:', { token: !!token, userData: !!userData });
        }

        if (token && userData) {
          const user = JSON.parse(userData);
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ useCustomAuth - Utilisateur trouvé:', user.email);
          }
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            loading: false
          });
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ useCustomAuth - Pas d\'authentification');
          }
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false
          });
        }
      } catch (error) {
        console.error('❌ useCustomAuth - Erreur:', error);
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        });
      }
    };

    // Vérifier immédiatement
    checkAuthState();

    // Écouter les changements dans localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user_data') {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 useCustomAuth - Changement localStorage détecté');
        }
        checkAuthState();
      }
    };

    // Écouter les événements personnalisés
    const handleCustomEvent = (e: CustomEvent) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 useCustomAuth - Événement personnalisé détecté:', e.type);
      }
      checkAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleCustomEvent as EventListener);
    window.addEventListener('userLoggedOut', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleCustomEvent as EventListener);
      window.removeEventListener('userLoggedOut', handleCustomEvent as EventListener);
    };
  }, [isClient]);

  // Fonction pour se connecter
  const signIn = useCallback((user: User, token: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 useCustomAuth - signIn appelé:', { user: user.email, token: !!token });
    }
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    
    if (process.env.NODE_ENV === 'development') {
      console.log('💾 useCustomAuth - Données sauvegardées dans localStorage');
    }
    
    setAuthState({
      user,
      token,
      isAuthenticated: true,
      loading: false
    });
    
    // Déclencher un événement personnalisé pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('userLoggedIn', { 
      detail: { user, token } 
    }));
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ useCustomAuth - État mis à jour:', { 
        user: user.email, 
        isAuthenticated: true, 
        loading: false 
      });
    }
  }, []);

  // Fonction pour se déconnecter
  const signOut = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 useCustomAuth - signOut appelé');
    }
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false
    });
    
    // Déclencher un événement personnalisé pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ useCustomAuth - Déconnexion réussie');
    }
  }, []);

  // Fonction pour obtenir les headers d'authentification
  const getAuthHeaders = useCallback(() => {
    if (!authState.token) {
      throw new Error('Aucun token d\'authentification disponible');
    }
    
    return {
      'Authorization': `Bearer ${authState.token}`,
      'Content-Type': 'application/json',
    };
  }, [authState.token]);

  // Fonction pour faire une requête authentifiée
  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expiré ou invalide
      signOut();
      throw new Error('Session expirée');
    }

    return response;
  }, [getAuthHeaders, signOut]);

  return useMemo(() => ({
    ...authState,
    signIn,
    signOut,
    getAuthHeaders,
    authenticatedFetch,
  }), [authState, signIn, signOut, getAuthHeaders, authenticatedFetch]);
}
