// Re-export du service centralisé pour éviter les instances multiples
import { getSupabaseClient } from './supabaseService';

// Export de l'instance singleton
export const supabase = getSupabaseClient();
export { getSupabaseClient }; 