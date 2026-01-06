import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Vérifier la session actuelle
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erreur de session:', error);
          return;
        }
        
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error('Erreur lors de la vérification de session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fonction pour obtenir les headers d'authentification
  const getAuthHeaders = () => {
    if (!session?.access_token) {
      throw new Error('Aucun token d\'authentification disponible');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
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
      // Token expiré, essayer de rafraîchir
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      if (error || !newSession) {
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
      
      setSession(newSession);
      
      // Retry avec le nouveau token
      const newHeaders = {
        ...getAuthHeaders(),
        ...options.headers,
      };
      
      return fetch(url, {
        ...options,
        headers: newHeaders,
      });
    }

    return response;
  };

  return {
    user,
    session,
    loading,
    getAuthHeaders,
    authenticatedFetch,
  };
}
