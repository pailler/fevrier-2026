// Configuration Supabase centralisée avec valeurs par défaut garanties
// Ce fichier garantit que les valeurs Supabase sont toujours disponibles,
// même si les variables d'environnement ne sont pas définies au moment du build

// Valeurs par défaut hardcodées - TOUJOURS utilisées comme fallback
export const DEFAULT_SUPABASE_URL = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';
export const DEFAULT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

// Fonction helper pour obtenir une variable d'environnement avec fallback garanti
// Évite que process.env.NEXT_PUBLIC_* soit undefined dans le bundle
export function getEnvVar(key: string, defaultValue: string): string {
  try {
    const value = typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
    // Si la valeur est undefined, null, ou la chaîne "undefined", utiliser la valeur par défaut
    if (!value || value === 'undefined' || value === 'null' || (typeof value === 'string' && value.trim() === '')) {
      return defaultValue;
    }
    return value as string;
  } catch (error) {
    // En cas d'erreur, toujours retourner la valeur par défaut
    return defaultValue;
  }
}

// Fonctions exportées pour obtenir les valeurs Supabase avec fallback garanti
export function getSupabaseUrl(): string {
  return getEnvVar('NEXT_PUBLIC_SUPABASE_URL', DEFAULT_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string {
  return getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', DEFAULT_SUPABASE_ANON_KEY);
}

export function getSupabaseServiceRoleKey(): string {
  return getEnvVar('SUPABASE_SERVICE_ROLE_KEY', DEFAULT_SERVICE_ROLE_KEY);
}

