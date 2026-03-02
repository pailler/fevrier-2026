import { createClient } from '@supabase/supabase-js';

// Valeurs par défaut pour éviter les erreurs si les variables d'environnement ne sont pas disponibles
const DEFAULT_SUPABASE_URL = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const DEFAULT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

// Fonction helper pour obtenir une variable d'environnement avec fallback
function getEnvVar(key: string, defaultValue: string): string {
  try {
    const value = typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
    if (!value || value === 'undefined' || value === 'null' || (typeof value === 'string' && value.trim() === '')) {
      return defaultValue;
    }
    return value as string;
  } catch (error) {
    return defaultValue;
  }
}

// Créer le client Supabase avec valeurs par défaut garanties
const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', DEFAULT_SUPABASE_URL);
const supabaseKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY', DEFAULT_SERVICE_ROLE_KEY);

const supabase = createClient(supabaseUrl, supabaseKey);

export interface LibreSpeedAccessResult {
  hasAccess: boolean;
  reason?: string;
  token?: string;
}

export class LibreSpeedAccessService {
  private static instance: LibreSpeedAccessService;

  public static getInstance(): LibreSpeedAccessService {
    if (!LibreSpeedAccessService.instance) {
      LibreSpeedAccessService.instance = new LibreSpeedAccessService();
    }
    return LibreSpeedAccessService.instance;
  }

  /**
   * Vérifie si l'utilisateur a accès à LibreSpeed
   */
  async checkAccess(userId: string, userEmail: string): Promise<LibreSpeedAccessResult> {
    try {
      console.log('🔍 LibreSpeed: Vérification accès pour:', { userId, userEmail });

      // 1. Vérifier que l'utilisateur a LibreSpeed activé
      const { data: userAccess, error: accessError } = await supabase
        .from('user_applications')
        .select('id, is_active')
        .eq('user_id', userId)
        .eq('module_id', 'librespeed')
        .eq('is_active', true)
        .single();

      if (accessError || !userAccess) {
        return {
          hasAccess: false,
          reason: 'LibreSpeed non activé pour votre compte'
        };
      }

      ;
      return { hasAccess: true };
    } catch (error) {
      console.error('❌ LibreSpeed: Erreur vérification accès:', error);
      return {
        hasAccess: false,
        reason: 'Erreur lors de la vérification d\'accès'
      };
    }
  }

  /**
   * Génère un token d'accès temporaire pour LibreSpeed
   */
  async generateAccessToken(userId: string, userEmail: string): Promise<LibreSpeedAccessResult> {
    try {
      console.log('🔑 LibreSpeed: Génération token pour:', { userId, userEmail });

      // Vérifier d'abord l'accès
      const accessCheck = await this.checkAccess(userId, userEmail);
      if (!accessCheck.hasAccess) {
        return accessCheck;
      }

      // Générer un token aléatoire
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure (60 minutes)

      // Enregistrer le token dans la table librespeed_tokens
      const { error: insertError } = await supabase
        .from('librespeed_tokens')
        .insert([{
          token: token,
          user_id: userId,
          user_email: userEmail,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          is_used: false
        }]);

      if (insertError) {
        console.error('❌ LibreSpeed: Erreur insertion token:', insertError);
        return {
          hasAccess: false,
          reason: 'Erreur lors de la génération du token'
        };
      }

      ;
      return {
        hasAccess: true,
        token: token
      };
    } catch (error) {
      console.error('❌ LibreSpeed: Erreur génération token:', error);
      return {
        hasAccess: false,
        reason: 'Erreur lors de la génération du token'
      };
    }
  }

  /**
   * Valide un token d'accès LibreSpeed
   */
  async validateToken(token: string): Promise<LibreSpeedAccessResult> {
    try {
      ;

      const { data: tokenData, error: tokenError } = await supabase
        .from('librespeed_tokens')
        .select('id, user_id, user_email, expires_at, is_used')
        .eq('token', token)
        .eq('is_used', false)
        .single();

      if (tokenError || !tokenData) {
        ;
        return {
          hasAccess: false,
          reason: 'Token invalide ou expiré'
        };
      }

      // Vérifier l'expiration
      if (tokenData.expires_at) {
        const expirationDate = new Date(tokenData.expires_at);
        const now = new Date();
        
        if (expirationDate <= now) {
          ;
          return {
            hasAccess: false,
            reason: 'Token expiré'
          };
        }
      }

      // Marquer le token comme utilisé
      await supabase
        .from('librespeed_tokens')
        .update({ is_used: true })
        .eq('id', tokenData.id);

      console.log('✅ LibreSpeed: Token valide pour:', tokenData.user_email);
      return {
        hasAccess: true,
        token: token
      };
    } catch (error) {
      console.error('❌ LibreSpeed: Erreur validation token:', error);
      return {
        hasAccess: false,
        reason: 'Erreur lors de la validation du token'
      };
    }
  }
}

