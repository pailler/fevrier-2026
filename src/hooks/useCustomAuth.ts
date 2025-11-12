'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';
import { isAdminUser } from '../utils/sessionDurationCheck';

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

const SESSION_DURATION_MS = 60 * 60 * 1000; // 60 minutes (1 heure)

export function useCustomAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true
  });

  const [isClient, setIsClient] = useState(false);
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);
  }, []);

  // Fonction pour vérifier et déconnecter si la session a expiré
  const checkSessionExpiry = useCallback(async () => {
    if (!isClient) return;

    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      const sessionStartTime = localStorage.getItem('session_start_time');

      if (!token || !userData || !sessionStartTime) {
        return; // Pas de session active
      }

      const sessionStart = parseInt(sessionStartTime, 10);
      const now = Date.now();
      const sessionAge = now - sessionStart;

      // Vérifier si l'utilisateur est admin (exception: pas de déconnexion automatique)
      const user = JSON.parse(userData);
      if (isAdminUser(user.email)) {
        console.log('👑 Utilisateur admin détecté - Pas de déconnexion automatique');
        return; // Ne pas déconnecter l'admin
      }

      // Si la session a dépassé 1 heure, déconnecter
      if (sessionAge > SESSION_DURATION_MS) {
        console.log('⏰ Session expirée après 1 heure, déconnexion automatique...');
        
        // Déconnecter Supabase Auth
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.warn('⚠️ Erreur lors de la déconnexion Supabase:', error);
        }

        // Nettoyer localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('session_start_time');

        // Mettre à jour l'état
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        });

        // Déclencher l'événement de déconnexion
        window.dispatchEvent(new CustomEvent('userLoggedOut'));

        // Rediriger vers la page de connexion avec un message
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}&error=session_expired&message=${encodeURIComponent('Votre session a expiré après 1 heure. Veuillez vous reconnecter.')}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de session:', error);
    }
  }, [isClient, router]);

  useEffect(() => {
    // Ne pas exécuter côté serveur
    if (!isClient) return;

    // Vérifier l'état d'authentification au chargement
    const checkAuthState = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        // Vérification de l'authentification

        if (token && userData) {
          const user = JSON.parse(userData);
          
          // Vérifier si l'utilisateur est admin (exception: pas de déconnexion automatique)
          if (isAdminUser(user.email)) {
            console.log('👑 Utilisateur admin détecté - Pas de vérification d\'expiration');
            // Admin: ne pas vérifier l'expiration, continuer normalement
          } else {
            // Vérifier si la session a expiré (uniquement pour les non-admins)
            const sessionStartTime = localStorage.getItem('session_start_time');
            if (sessionStartTime) {
              const sessionStart = parseInt(sessionStartTime, 10);
              const now = Date.now();
              const sessionAge = now - sessionStart;
              
              if (sessionAge > SESSION_DURATION_MS) {
                // Session expirée, déconnecter
                checkSessionExpiry();
                return;
              }
            }
          }
          
          // Utilisateur authentifié
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            loading: false
          });
        } else {
          if (process.env.NODE_ENV === 'development') {
            ;
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

    // Vérifier périodiquement la session (toutes les minutes)
    sessionCheckIntervalRef.current = setInterval(() => {
      checkSessionExpiry();
    }, 60 * 1000); // Vérifier toutes les minutes

    // Écouter les changements dans localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user_data') {
        // Changement localStorage détecté
        checkAuthState();
      }
    };

    // Écouter les événements personnalisés
    const handleCustomEvent = (e: CustomEvent) => {
      // Événement personnalisé détecté
      checkAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleCustomEvent as EventListener);
    window.addEventListener('userLoggedOut', handleCustomEvent as EventListener);

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleCustomEvent as EventListener);
      window.removeEventListener('userLoggedOut', handleCustomEvent as EventListener);
    };
  }, [isClient, checkSessionExpiry]);

  // Fonction pour se connecter
  const signIn = useCallback((user: User, token: string) => {
    // Connexion utilisateur
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    // Stocker la date de début de session pour vérifier l'expiration
    localStorage.setItem('session_start_time', Date.now().toString());
    
    // Données sauvegardées
    
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
    
    // État mis à jour
  }, []);

  // Fonction pour se déconnecter
  const signOut = useCallback(async () => {
    // Déconnexion utilisateur
    
    // Déconnecter Supabase Auth
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('⚠️ Erreur lors de la déconnexion Supabase:', error);
    }
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('session_start_time');
    
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false
    });
    
    // Déclencher un événement personnalisé pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    if (process.env.NODE_ENV === 'development') {
      ;
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
