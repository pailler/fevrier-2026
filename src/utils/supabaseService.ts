import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration Supabase - Utiliser les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Instance singleton pour éviter les instances multiples
let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!clientInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variables d\'environnement Supabase manquantes');
    }
    
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce'
      }
    });
  }
  return clientInstance;
};

// Export pour compatibilité - utiliser getSupabaseClient() pour éviter les instances multiples
// export const supabase = getSupabaseClient();





