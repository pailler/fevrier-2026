'use client';

import { useState, useEffect } from 'react';

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
    loading: true
  });

  useEffect(() => {
    // Vérifier l'état d'authentification au chargement
    const checkAuthState = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        console.log('🔍 useCustomAuth - Vérification:', { token: !!token, userData: !!userData });

        if (token && userData) {
          const user = JSON.parse(userData);
          console.log('✅ useCustomAuth - Utilisateur trouvé:', user.email);
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            loading: false
          });
        } else {
          console.log('❌ useCustomAuth - Pas d\'authentification');
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
        console.log('🔄 useCustomAuth - Changement localStorage détecté');
        checkAuthState();
      }
    };

    // Écouter les événements personnalisés
    const handleCustomEvent = (e: CustomEvent) => {
      console.log('🔄 useCustomAuth - Événement personnalisé détecté:', e.type);
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
  }, []);

  // Fonction pour se connecter
  const signIn = (user: User, token: string) => {
    console.log('🔄 useCustomAuth - signIn appelé:', { user: user.email, token: !!token });
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    
    console.log('💾 useCustomAuth - Données sauvegardées dans localStorage');
    
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
    
    console.log('✅ useCustomAuth - État mis à jour:', { 
      user: user.email, 
      isAuthenticated: true, 
      loading: false 
    });
  };

  // Fonction pour se déconnecter
  const signOut = () => {
    console.log('🔄 useCustomAuth - signOut appelé');
    
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
    
    console.log('✅ useCustomAuth - Déconnexion réussie');
  };

  // Fonction pour obtenir les headers d'authentification
  const getAuthHeaders = () => {
    if (!authState.token) {
      throw new Error('Aucun token d\'authentification disponible');
    }
    
    return {
      'Authorization': `Bearer ${authState.token}`,
      'Content-Type': 'application/json',
    };
  };

  // Fonction pour faire une requête authentifiée
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
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
  };

  return {
    ...authState,
    signIn,
    signOut,
    getAuthHeaders,
    authenticatedFetch,
  };
}
