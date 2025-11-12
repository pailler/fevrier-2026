// Re-export du service centralisé pour éviter les instances multiples
import { getSupabaseClient, supabase as supabaseService } from './supabaseService';

// Export de l'instance singleton (lazy initialization)
export const supabase = supabaseService;
export { getSupabaseClient }; 