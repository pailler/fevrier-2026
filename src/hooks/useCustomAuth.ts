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
const MAX_NETWORK_ERRORS = 3; // Arrêter après 3 erreurs réseau consécutives

// Fonction pour détecter si une erreur est due à un problème réseau
const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  const errorMessage = error?.message || error?.toString() || '';
  const errorName = error?.name || '';
  
  return (
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('NetworkError') ||
    errorMessage.includes('ERR_FAILED') ||
    errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
    errorMessage.includes('ERR_NETWORK_CHANGED') ||
    errorMessage.includes('CORS') ||
    errorName === 'NetworkError' ||
    (errorName === 'TypeError' && errorMessage.includes('fetch'))
  );
};

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
  const networkErrorCountRef = useRef<number>(0);
  const errorHandlerRef = useRef<((error: ErrorEvent) => void) | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_LOADING_TIME = 5000; // Maximum 5 secondes de chargement

  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);
  }, []);

  // Fonction pour vérifier et déconnecter si la session a expiré
  // DÉSACTIVÉE : Plus de déconnexion automatique après 1 heure
  const checkSessionExpiry = useCallback(async () => {
    if (!isClient) return;

    // Désactivation de la déconnexion automatique - toujours retourner sans déconnecter
    return;

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

      // DÉSACTIVÉ : Si la session a dépassé 1 heure, déconnecter
      // Plus de déconnexion automatique
      if (false && sessionAge > SESSION_DURATION_MS) {
        // Vérifier si on est déjà sur la page de login pour éviter les redirections multiples
        if (window.location.pathname === '/login') {
          return; // Déjà sur la page de login, ne rien faire
        }
        
        // Déconnecter Supabase Auth silencieusement (sans logs excessifs)
        try {
          await supabase.auth.signOut();
        } catch (error) {
          // Ignorer silencieusement les erreurs de déconnexion en mode déconnecté
          if (!isNetworkError(error)) {
            // Seulement logger si ce n'est pas une erreur réseau
            console.warn('⚠️ Erreur lors de la déconnexion Supabase:', error);
          }
        }

        // Nettoyer complètement le localStorage (y compris les tokens Supabase)
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('session_start_time');
        
        // Nettoyer également le storage Supabase pour éviter les conflits
        try {
          const supabaseStorageKey = 'sb-xemtoyzcihmncbrlsmhr-auth-token';
          localStorage.removeItem(supabaseStorageKey);
          
          // Nettoyer toutes les clés Supabase potentielles
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
              localStorage.removeItem(key);
            }
          });
        } catch (storageError) {
          console.warn('⚠️ Erreur lors du nettoyage du storage Supabase:', storageError);
        }
        
        // Réinitialiser l'instance Supabase pour éviter les instances multiples
        if (typeof window !== 'undefined' && (window as any).__supabaseClientInstance) {
          delete (window as any).__supabaseClientInstance;
        }
        
        // Réinitialiser le compteur d'erreurs réseau
        networkErrorCountRef.current = 0;

        // Mettre à jour l'état
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        });

        // Déclencher l'événement de déconnexion
        window.dispatchEvent(new CustomEvent('userLoggedOut'));

        // Rediriger vers la page de connexion avec un message (une seule fois)
        const currentPath = window.location.pathname;
        // Vérifier qu'on n'est pas déjà en train de rediriger
        if (!sessionStorage.getItem('session_expired_redirected')) {
          sessionStorage.setItem('session_expired_redirected', 'true');
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}&error=session_expired&message=${encodeURIComponent('Votre session a expiré après 1 heure. Veuillez vous reconnecter.')}`);
          
          // Nettoyer le flag après 5 secondes pour permettre une nouvelle redirection si nécessaire
          setTimeout(() => {
            sessionStorage.removeItem('session_expired_redirected');
          }, 5000);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de session:', error);
    }
  }, [isClient, router]);

  useEffect(() => {
    // Ne pas exécuter côté serveur
    if (!isClient) return;

    // Fonction pour synchroniser session_start_time depuis la table user_sessions si manquant
    const syncSessionStartTime = async (userId: string) => {
      const sessionStartTime = localStorage.getItem('session_start_time');
      if (sessionStartTime) {
        return; // Déjà défini, pas besoin de synchroniser
      }

      try {
        // Récupérer la date de début de session depuis la table user_sessions
        const response = await fetch(`/api/get-session-start-time?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.sessionStartTime) {
            localStorage.setItem('session_start_time', data.sessionStartTime.toString());
            console.log('✅ session_start_time synchronisé depuis user_sessions');
          }
        }
      } catch (error) {
        console.warn('⚠️ Erreur lors de la synchronisation de session_start_time:', error);
      }
    };

    // Vérifier l'état d'authentification au chargement
    const checkAuthState = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        // Si pas de token ni userData, arrêter immédiatement le chargement
        if (!token || !userData) {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false
          });
          return;
        }

        // Vérification de l'authentification
        const user = JSON.parse(userData);
        
        // Vérifier d'abord si la session est expirée (sans faire d'appel réseau)
        const sessionStartTime = localStorage.getItem('session_start_time');
        if (sessionStartTime) {
          const sessionStart = parseInt(sessionStartTime, 10);
          const now = Date.now();
          const sessionAge = now - sessionStart;
          
          // DÉSACTIVÉ : Plus de vérification de durée de session
          // if (sessionAge > SESSION_DURATION_MS && !isAdminUser(user.email)) {
          //   checkSessionExpiry();
          //   return;
          // }
        }
        
        // Vérifier la connectivité réseau avant de faire des appels
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          // Mode déconnecté détecté, utiliser les données en cache
          console.warn('⚠️ Mode déconnecté détecté - Utilisation des données en cache');
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            loading: false
          });
          return;
        }
        
        // Synchroniser session_start_time si manquant (seulement si connecté)
        // Utiliser un timeout très court pour éviter d'attendre trop longtemps
        const syncPromise = syncSessionStartTime(user.id);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 1000) // Timeout de 1 seconde seulement
        );
        
        try {
          await Promise.race([syncPromise, timeoutPromise]);
          // Réinitialiser le compteur d'erreurs réseau en cas de succès
          networkErrorCountRef.current = 0;
        } catch (syncError) {
          // Si timeout ou erreur réseau, utiliser les données en cache immédiatement
          if (isNetworkError(syncError) || (syncError instanceof Error && syncError.message === 'Timeout')) {
            networkErrorCountRef.current += 1;
            
            // Utiliser les données en cache et arrêter le chargement immédiatement
            // Ne pas attendre MAX_NETWORK_ERRORS en mode déconnecté
            console.warn('⚠️ Erreur réseau ou timeout - Utilisation des données en cache');
            setAuthState({
              user,
              token,
              isAuthenticated: true,
              loading: false
            });
            return;
          }
          // Pour les autres erreurs, continuer normalement avec les données en cache
        }
        
        // Vérifier si l'utilisateur est admin (exception: pas de déconnexion automatique)
        if (isAdminUser(user.email)) {
          // Admin: ne pas vérifier l'expiration, continuer normalement
        } else {
          // Vérifier si la session a expiré (uniquement pour les non-admins)
          if (sessionStartTime) {
            const sessionStart = parseInt(sessionStartTime, 10);
            const now = Date.now();
            const sessionAge = now - sessionStart;
            
            // DÉSACTIVÉ : Plus de vérification de durée de session
            // if (sessionAge > SESSION_DURATION_MS) {
            //   // Session expirée, déconnecter
            //   checkSessionExpiry();
            //   return;
            // }
          }
        }
        
        // Utilisateur authentifié
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          loading: false
        });
      } catch (error) {
        console.error('❌ useCustomAuth - Erreur:', error);
        
        // En cas d'erreur, essayer d'utiliser les données en cache si disponibles
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            setAuthState({
              user,
              token,
              isAuthenticated: true,
              loading: false
            });
            return;
          } catch (parseError) {
            // Si erreur de parsing, considérer comme non authentifié
          }
        }
        
        // Si c'est une erreur réseau, incrémenter le compteur
        if (isNetworkError(error)) {
          networkErrorCountRef.current += 1;
          
          // Si trop d'erreurs réseau, arrêter le chargement
          if (networkErrorCountRef.current >= MAX_NETWORK_ERRORS) {
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false
            });
            return;
          }
        }
        
        // En cas d'erreur, arrêter le chargement
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        });
      }
    };

    // Intercepteur global pour capturer les erreurs de rafraîchissement automatique
    errorHandlerRef.current = (event: ErrorEvent) => {
      const error = event.error || event.message;
      if (isNetworkError(error) || (event.message && isNetworkError({ message: event.message }))) {
        // Vérifier si c'est une erreur liée au rafraîchissement du token Supabase
        const isTokenRefreshError = 
          event.message?.includes('token') ||
          event.message?.includes('refresh') ||
          event.filename?.includes('supabase') ||
          (event.target && (event.target as any).src?.includes('supabase'));
        
        if (isTokenRefreshError) {
          // Vérifier si la session est déjà expirée pour éviter les erreurs répétées
          const sessionStartTime = localStorage.getItem('session_start_time');
          if (sessionStartTime) {
            const sessionStart = parseInt(sessionStartTime, 10);
            const sessionAge = Date.now() - sessionStart;
            // DÉSACTIVÉ : Plus de vérification de durée de session
            // if (sessionAge > SESSION_DURATION_MS) {
            //   // Session expirée, ignorer silencieusement les erreurs de rafraîchissement
            //   return;
            // }
          }
          
          networkErrorCountRef.current += 1;
          // Réduire les logs console pour éviter le spam
          if (networkErrorCountRef.current <= MAX_NETWORK_ERRORS) {
            console.warn(`⚠️ Erreur réseau lors du rafraîchissement du token (${networkErrorCountRef.current}/${MAX_NETWORK_ERRORS})`);
          }
          
          // Si trop d'erreurs réseau, arrêter le chargement
          if (networkErrorCountRef.current >= MAX_NETWORK_ERRORS) {
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false
            });
          }
        }
      }
    };

    // Ajouter l'intercepteur d'erreurs global
    window.addEventListener('error', errorHandlerRef.current);

    // Intercepteur pour les promesses rejetées non capturées
    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (isNetworkError(error)) {
        // Vérifier si c'est une erreur liée au rafraîchissement du token Supabase
        const errorMessage = error?.message || error?.toString() || '';
        const isTokenRefreshError = 
          errorMessage.includes('token') ||
          errorMessage.includes('refresh') ||
          errorMessage.includes('supabase');
        
        if (isTokenRefreshError) {
          // Vérifier si la session est déjà expirée pour éviter les erreurs répétées
          const sessionStartTime = localStorage.getItem('session_start_time');
          if (sessionStartTime) {
            const sessionStart = parseInt(sessionStartTime, 10);
            const sessionAge = Date.now() - sessionStart;
            if (sessionAge > SESSION_DURATION_MS) {
              // Session expirée, ignorer silencieusement les erreurs de rafraîchissement
              event.preventDefault(); // Empêcher l'affichage dans la console
              return;
            }
          }
          
          networkErrorCountRef.current += 1;
          // Réduire les logs console pour éviter le spam
          if (networkErrorCountRef.current <= MAX_NETWORK_ERRORS) {
            console.warn(`⚠️ Erreur réseau lors du rafraîchissement du token (promesse rejetée) (${networkErrorCountRef.current}/${MAX_NETWORK_ERRORS})`);
          }
          
          // Si trop d'erreurs réseau, arrêter le chargement
          if (networkErrorCountRef.current >= MAX_NETWORK_ERRORS) {
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false
            });
            // Empêcher l'affichage de l'erreur dans la console
            event.preventDefault();
          }
        }
      }
    };

    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    // Timeout de sécurité pour éviter un chargement infini
    loadingTimeoutRef.current = setTimeout(() => {
      // Si après 5 secondes on est toujours en chargement, arrêter
      setAuthState(prevState => {
        if (prevState.loading) {
          console.warn('⚠️ Timeout de chargement - Arrêt après 5 secondes');
          // Vérifier si on a des données en cache
          const token = localStorage.getItem('auth_token');
          const userData = localStorage.getItem('user_data');
          
          if (token && userData) {
            try {
              const user = JSON.parse(userData);
              return {
                user,
                token,
                isAuthenticated: true,
                loading: false
              };
            } catch (error) {
              // Si erreur de parsing, considérer comme non authentifié
              return {
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false
              };
            }
          } else {
            // Pas de données, considérer comme non authentifié
            return {
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false
            };
          }
        }
        return prevState;
      });
    }, MAX_LOADING_TIME);

    // Vérifier immédiatement
    checkAuthState();

    // Écouter les changements d'authentification Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          // Vérifier si la session est expirée avant de traiter l'événement
          const sessionStartTime = localStorage.getItem('session_start_time');
          if (sessionStartTime) {
            const sessionStart = parseInt(sessionStartTime, 10);
            const sessionAge = Date.now() - sessionStart;
            
            // DÉSACTIVÉ : Plus de vérification de durée de session
            // Si la session est expirée et que ce n'est pas une déconnexion explicite, ignorer l'événement
            // if (sessionAge > SESSION_DURATION_MS && event !== 'SIGNED_OUT') {
            //   // Ignorer silencieusement les tentatives de rafraîchissement quand la session est expirée
            //   if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            //     return;
            //   }
            // }
          }
          
          // Si une session existe et qu'on a un token mais pas de session_start_time, synchroniser
          if (session?.user && event !== 'SIGNED_OUT') {
            const token = localStorage.getItem('auth_token');
            const userData = localStorage.getItem('user_data');
            
            // Si on a une session Supabase mais pas de session_start_time, synchroniser
            if (token && userData && !sessionStartTime) {
              try {
                const user = JSON.parse(userData);
                await syncSessionStartTime(user.id);
                // Réinitialiser le compteur d'erreurs réseau en cas de succès
                networkErrorCountRef.current = 0;
              } catch (syncError) {
                if (isNetworkError(syncError)) {
                  networkErrorCountRef.current += 1;
                  // Réduire les logs pour éviter le spam
                  if (networkErrorCountRef.current <= MAX_NETWORK_ERRORS) {
                    console.warn(`⚠️ Erreur réseau lors de la synchronisation (${networkErrorCountRef.current}/${MAX_NETWORK_ERRORS})`);
                  }
                  
                  // Si trop d'erreurs réseau, arrêter le chargement
                  if (networkErrorCountRef.current >= MAX_NETWORK_ERRORS) {
                    setAuthState({
                      user: null,
                      token: null,
                      isAuthenticated: false,
                      loading: false
                    });
                    return;
                  }
                }
              }
            }
            
            // Mettre à jour le token si nécessaire (mais ne pas réinitialiser session_start_time)
            // Seulement si la session n'est pas expirée
            if (session.access_token && session.access_token !== token) {
              if (!sessionStartTime || (Date.now() - parseInt(sessionStartTime, 10)) <= SESSION_DURATION_MS) {
                localStorage.setItem('auth_token', session.access_token);
                // Ne PAS réinitialiser session_start_time lors du rafraîchissement du token
              }
            }
          }
          
          // Si déconnexion, nettoyer
          if (event === 'SIGNED_OUT') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('session_start_time');
            networkErrorCountRef.current = 0; // Réinitialiser le compteur
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false
            });
          }
          
          // Si l'événement est TOKEN_REFRESHED et qu'on a des erreurs réseau, arrêter le chargement
          if (event === 'TOKEN_REFRESHED' && networkErrorCountRef.current >= MAX_NETWORK_ERRORS) {
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false
            });
          }
        } catch (error) {
          // Gérer les erreurs dans onAuthStateChange
          if (isNetworkError(error)) {
            networkErrorCountRef.current += 1;
            // Réduire les logs pour éviter le spam
            if (networkErrorCountRef.current <= MAX_NETWORK_ERRORS) {
              console.warn(`⚠️ Erreur réseau dans onAuthStateChange (${networkErrorCountRef.current}/${MAX_NETWORK_ERRORS})`);
            }
            
            // Si trop d'erreurs réseau, arrêter le chargement
            if (networkErrorCountRef.current >= MAX_NETWORK_ERRORS) {
              setAuthState({
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false
              });
            }
          } else {
            // Seulement logger les erreurs non-réseau en développement
            if (process.env.NODE_ENV === 'development') {
              console.error('❌ Erreur dans onAuthStateChange:', error);
            }
          }
        }
      }
    );

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

    // Écouter les changements de connectivité réseau
    const handleOnline = () => {
      console.log('✅ Connexion réseau rétablie');
      networkErrorCountRef.current = 0; // Réinitialiser le compteur d'erreurs
    };

    const handleOffline = () => {
      console.warn('⚠️ Connexion réseau perdue');
      // Arrêter immédiatement le chargement si on détecte qu'on est déconnecté
      setAuthState(prevState => {
        if (prevState.loading) {
          // Utiliser les données en cache si disponibles
          const token = localStorage.getItem('auth_token');
          const userData = localStorage.getItem('user_data');
          
          if (token && userData) {
            try {
              const user = JSON.parse(userData);
              return {
                user,
                token,
                isAuthenticated: true,
                loading: false
              };
            } catch (error) {
              return {
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false
              };
            }
          }
          
          return {
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false
          };
        }
        return prevState;
      });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleCustomEvent as EventListener);
    window.addEventListener('userLoggedOut', handleCustomEvent as EventListener);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      subscription.unsubscribe();
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleCustomEvent as EventListener);
      window.removeEventListener('userLoggedOut', handleCustomEvent as EventListener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (errorHandlerRef.current) {
        window.removeEventListener('error', errorHandlerRef.current);
      }
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]); // Retirer checkSessionExpiry des dépendances pour éviter les boucles

  // Fonction pour se connecter
  const signIn = useCallback((user: User, token: string) => {
    // Nettoyer d'abord les données résiduelles pour éviter les conflits
    try {
      // Nettoyer les anciennes clés avant de stocker les nouvelles
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('session_start_time');
      
      // Nettoyer les clés Supabase potentielles (elles seront recréées si nécessaire)
      const supabaseStorageKey = 'sb-xemtoyzcihmncbrlsmhr-auth-token';
      localStorage.removeItem(supabaseStorageKey);
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key !== supabaseStorageKey) {
          localStorage.removeItem(key);
        }
      });
    } catch (cleanupError) {
      console.warn('⚠️ Erreur lors du nettoyage avant connexion:', cleanupError);
    }
    
    // Stocker les nouvelles données d'authentification
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    // Stocker la date de début de session pour vérifier l'expiration
    localStorage.setItem('session_start_time', Date.now().toString());
    
    // Mettre à jour l'état d'authentification
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
    
    console.log('✅ Connexion réussie pour:', user.email);
  }, []);

  // Fonction pour se déconnecter
  const signOut = useCallback(async () => {
    console.log('🔄 Déconnexion en cours...');
    
    // Mettre à jour l'état immédiatement pour éviter les conflits
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false
    });
    
    // Déclencher l'événement de déconnexion immédiatement pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    // Déconnecter Supabase Auth avec un timeout pour éviter les blocages
    try {
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      );
      await Promise.race([signOutPromise, timeoutPromise]);
    } catch (error) {
      // Ignorer les erreurs de timeout ou autres erreurs de déconnexion
      // Le nettoyage manuel ci-dessous garantit que tout est nettoyé
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Erreur lors de la déconnexion Supabase:', error);
      }
    }
    
    // Nettoyer complètement le localStorage (y compris les tokens Supabase)
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('session_start_time');
      
      // Nettoyer également le storage Supabase pour éviter les conflits
      const supabaseStorageKey = 'sb-xemtoyzcihmncbrlsmhr-auth-token';
      localStorage.removeItem(supabaseStorageKey);
      
      // Nettoyer toutes les clés Supabase potentielles
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      
      // Nettoyer également sessionStorage pour éviter les conflits
      try {
        sessionStorage.removeItem('session_expired_redirected');
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (sessionError) {
        // Ignorer les erreurs de sessionStorage
      }
    } catch (storageError) {
      console.warn('⚠️ Erreur lors du nettoyage du storage:', storageError);
    }
    
    // Réinitialiser l'instance Supabase pour éviter les instances multiples
    if (typeof window !== 'undefined') {
      // Supprimer l'instance globale
      if ((window as any).__supabaseClientInstance) {
        delete (window as any).__supabaseClientInstance;
      }
      
      // Importer et utiliser resetSupabaseClient si disponible
      try {
        const { resetSupabaseClient } = require('../utils/supabaseService');
        resetSupabaseClient();
      } catch (resetError) {
        // Si l'import échoue, continuer sans erreur
      }
    }
    
    // Attendre un peu pour s'assurer que tous les listeners sont nettoyés
    // Cela évite les conflits lors de la reconnexion immédiate
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('✅ Déconnexion complète');
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
