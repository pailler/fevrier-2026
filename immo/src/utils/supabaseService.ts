import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration Supabase - Valeurs par défaut hardcodées pour éviter les erreurs
// IMPORTANT: Ces valeurs sont TOUJOURS utilisées comme fallback
// Next.js remplace process.env.NEXT_PUBLIC_* au build time, donc nous devons garantir
// que ces valeurs sont toujours disponibles même si les variables d'environnement ne le sont pas
const DEFAULT_SUPABASE_URL = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

// Fonction helper pour obtenir une variable d'environnement avec fallback garanti
// Évite que process.env.NEXT_PUBLIC_* soit undefined dans le bundle
function getEnvVar(key: string, defaultValue: string): string {
  try {
    // @ts-ignore - process.env peut être undefined au runtime côté client
    const value = typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
    // Si la valeur est undefined, null, ou la chaîne "undefined", utiliser la valeur par défaut
    if (!value || value === 'undefined' || value === 'null' || (typeof value === 'string' && value.trim() === '')) {
      return defaultValue;
    }
    return value as string;
  } catch (error) {
    // En cas d'erreur, toujours retourner la valeur par défaut
    console.warn(`⚠️ Erreur lors de la récupération de ${key}, utilisation de la valeur par défaut:`, error);
    return defaultValue;
  }
}

// Fonction pour obtenir la configuration Supabase avec fallback
// IMPORTANT: Utiliser directement les valeurs par défaut si les variables ne sont pas disponibles
// pour éviter que Next.js remplace process.env.NEXT_PUBLIC_* par "undefined" dans le bundle
function getSupabaseConfig() {
  // Utiliser getEnvVar qui garantit TOUJOURS une valeur valide (jamais undefined)
  // Cela évite que process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY soit undefined dans le bundle JavaScript
  // Si les variables d'environnement ne sont pas disponibles, utiliser directement les valeurs par défaut
  let supabaseUrl: string = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', DEFAULT_SUPABASE_URL);
  let supabaseAnonKey: string = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', DEFAULT_SUPABASE_ANON_KEY);
  
  // Double protection : garantir que les valeurs ne sont jamais undefined
  if (!supabaseUrl || supabaseUrl === 'undefined') {
    supabaseUrl = DEFAULT_SUPABASE_URL;
  }
  if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
    supabaseAnonKey = DEFAULT_SUPABASE_ANON_KEY;
  }
  
  // Vérifier si les valeurs sont valides (pas undefined, null, ou la chaîne "undefined")
  const isValidUrl = supabaseUrl && 
                     supabaseUrl !== 'undefined' && 
                     typeof supabaseUrl === 'string' &&
                     supabaseUrl.trim() !== '' && 
                     supabaseUrl.startsWith('http');
  
  const isValidKey = supabaseAnonKey && 
                     supabaseAnonKey !== 'undefined' && 
                     typeof supabaseAnonKey === 'string' &&
                     supabaseAnonKey.trim() !== '' && 
                     supabaseAnonKey.length > 50; // Les clés Supabase sont longues
  
  // Si les variables ne sont pas valides, utiliser les valeurs par défaut
  if (!isValidUrl) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL non valide, utilisation de la valeur par défaut', { 
      received: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined' 
    });
    supabaseUrl = DEFAULT_SUPABASE_URL;
  }
  
  if (!isValidKey) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY non valide, utilisation de la valeur par défaut', { 
      received: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined' 
    });
    supabaseAnonKey = DEFAULT_SUPABASE_ANON_KEY;
  }
  
  // Vérification finale - s'assurer que les valeurs sont toujours définies
  // Cette vérification ne devrait jamais échouer car nous avons des valeurs par défaut
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = `Variables d'environnement Supabase manquantes: URL=${!!supabaseUrl}, KEY=${!!supabaseAnonKey}`;
    console.error('❌', errorMsg);
    // Utiliser les valeurs par défaut en dernier recours
    return { 
      supabaseUrl: DEFAULT_SUPABASE_URL, 
      supabaseAnonKey: DEFAULT_SUPABASE_ANON_KEY 
    };
  }
  
  return { supabaseUrl, supabaseAnonKey };
}

// Instance singleton pour éviter les instances multiples
// Utiliser une variable globale pour s'assurer qu'il n'y a qu'une seule instance
let clientInstance: SupabaseClient | null = null;
let isCreating = false;

// Vérifier si une instance existe déjà dans le contexte global (pour éviter les doublons)
if (typeof window !== 'undefined') {
  // @ts-ignore - Propriété globale pour éviter les instances multiples
  if ((window as any).__supabaseClientInstance) {
    clientInstance = (window as any).__supabaseClientInstance;
    console.log('✅ Réutilisation de l\'instance Supabase existante');
  }
}

// Fonction pour réinitialiser l'instance Supabase (utile après déconnexion)
export const resetSupabaseClient = (): void => {
  clientInstance = null;
  isCreating = false;
  if (typeof window !== 'undefined') {
    delete (window as any).__supabaseClientInstance;
  }
  console.log('🔄 Instance Supabase réinitialisée');
};

export const getSupabaseClient = (): SupabaseClient => {
  // Vérifier d'abord dans le contexte global (priorité)
  if (typeof window !== 'undefined') {
    const globalInstance = (window as any).__supabaseClientInstance;
    if (globalInstance && globalInstance.auth) {
      console.log('✅ Réutilisation de l\'instance Supabase globale existante');
      clientInstance = globalInstance;
      return globalInstance;
    }
  }
  
  // Si une instance existe déjà, la retourner
  if (clientInstance) {
    return clientInstance;
  }
  
  // Si une création est en cours, retourner l'instance existante si elle existe
  if (isCreating) {
    console.warn('⚠️ Création d\'instance Supabase en cours, réutilisation si disponible...');
    // Si on a une instance globale, l'utiliser
    if (typeof window !== 'undefined') {
      const globalInstance = (window as any).__supabaseClientInstance;
      if (globalInstance && globalInstance.auth) {
        clientInstance = globalInstance;
        return globalInstance;
      }
    }
    // Si on a déjà une instance locale, l'utiliser
    if (clientInstance) {
      return clientInstance;
    }
    // Sinon, attendre un peu et réessayer (mais de manière synchrone pour éviter les problèmes)
    // En pratique, cela ne devrait pas arriver car isCreating est rapidement false
    // On va quand même créer une nouvelle instance pour éviter les blocages
  }
  
  isCreating = true;
  
  try {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    
    // Protection supplémentaire : s'assurer que les valeurs ne sont jamais undefined
    const finalUrl = supabaseUrl || DEFAULT_SUPABASE_URL;
    const finalKey = supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY;
    
    // Vérification finale avant de créer le client
    if (!finalUrl || !finalKey) {
      const errorMsg = `Impossible de créer le client Supabase: URL=${!!finalUrl}, KEY=${!!finalKey}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }
    
    // Configuration optimisée pour éviter les conflits et instances multiples
    clientInstance = createClient(finalUrl, finalKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // IMPORTANT: Doit être true pour que PKCE fonctionne
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'sb-xemtoyzcihmncbrlsmhr-auth-token', // Clé de stockage unique pour éviter les conflits
        flowType: 'pkce', // Utiliser PKCE (recommandé par Supabase pour une meilleure fiabilité)
        debug: false, // Désactiver les logs pour réduire les avertissements
      },
      realtime: {
        // Configuration pour gérer l'absence de WebSocket
        params: {
          eventsPerSecond: 10
        },
      },
      global: {
        headers: {
          'X-Client-Info': 'iahome-app'
        }
      }
    });
    
    // Stocker l'instance dans le contexte global pour éviter les doublons
    if (typeof window !== 'undefined') {
      // @ts-ignore - Propriété globale pour éviter les instances multiples
      (window as any).__supabaseClientInstance = clientInstance;
      console.log('✅ Instance Supabase stockée dans le contexte global');
    }
    
    console.log('✅ Instance Supabase créée (singleton)');
  } finally {
    isCreating = false;
  }
  
  return clientInstance;
};

// Export pour compatibilité - utiliser getSupabaseClient() pour éviter les instances multiples
// Lazy initialization: ne pas initialiser immédiatement, seulement quand nécessaire
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseInstance(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = getSupabaseClient();
  }
  return supabaseInstance;
}

// Créer un objet proxy qui délègue toutes les propriétés au client réel
// L'initialisation ne se fait que quand une propriété est accédée
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    try {
      const client = getSupabaseInstance();
      const value = (client as any)[prop];
      // Si c'est une fonction, bind le contexte
      if (typeof value === 'function') {
        return value.bind(client);
      }
      return value;
    } catch (error) {
      console.error('❌ Erreur lors de l\'accès à Supabase:', error);
      // Retourner une fonction qui lance une erreur si on essaie d'appeler une méthode
      if (typeof prop === 'string') {
        return () => {
          throw new Error(`Supabase client non disponible: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        };
      }
      throw error;
    }
  }
});

