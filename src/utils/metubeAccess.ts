import { getSupabaseClient } from './supabaseService';

const supabase = getSupabaseClient();

export interface MeTubeAccessResult {
  hasAccess: boolean;
  reason?: string;
  token?: string;
}

export interface MeTubeTokenValidation {
  hasAccess: boolean;
  userId?: string;
  userEmail?: string;
  reason?: string;
}

export class MeTubeAccessService {
  private static instance: MeTubeAccessService;
  private readonly TOKEN_EXPIRY_HOURS = 24; // 24 heures
  private readonly MAX_USAGE_PER_DAY = 50; // Maximum 50 utilisations par jour

  private constructor() {}

  public static getInstance(): MeTubeAccessService {
    if (!MeTubeAccessService.instance) {
      MeTubeAccessService.instance = new MeTubeAccessService();
    }
    return MeTubeAccessService.instance;
  }

  /**
   * Vérifier si un utilisateur a accès à MeTube
   */
  async checkAccess(userId: string, userEmail: string): Promise<MeTubeAccessResult> {
    try {
      console.log('🔍 MeTube Access: Vérification pour', { userId, userEmail });

      // Vérifier si l'utilisateur a un accès actif à MeTube
      const { data: userApp, error: userAppError } = await supabase
        .from('user_applications')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', 'metube')
        .eq('is_active', true)
        .single();

      if (userAppError || !userApp) {
        return {
          hasAccess: false,
          reason: 'Aucun accès MeTube trouvé pour votre compte'
        };
      }

      ;
      return { hasAccess: true };

    } catch (error) {
      console.error('❌ MeTube Access Error:', error);
      return {
        hasAccess: false,
        reason: 'Erreur lors de la vérification d\'accès'
      };
    }
  }

  /**
   * Générer un token d'accès temporaire pour MeTube
   */
  async generateAccessToken(userId: string, userEmail: string): Promise<MeTubeAccessResult> {
    try {
      console.log('🔑 MeTube Token: Génération pour', { userId, userEmail });

      // Vérifier d'abord l'accès
      const accessCheck = await this.checkAccess(userId, userEmail);
      if (!accessCheck.hasAccess) {
        return accessCheck;
      }

      // Générer un token provisoire
      const timestamp = Date.now();
      const randomPart = Math.random().toString(36).substring(2, 15);
      const token = `prov_${userId.substring(0, 8)}_${timestamp.toString(36)}${randomPart}`;

      // Enregistrer le token dans la base de données
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
      
      const { error: tokenError } = await supabase
        .from('access_tokens')
        .insert({
          jwt_token: token,
          created_by: userId,
          module_name: 'metube',
          expires_at: expiresAt.toISOString(),
          is_active: true,
          is_used: false
        });

      if (tokenError) {
        console.error('❌ MeTube Token: Erreur enregistrement token', tokenError);
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
      console.error('❌ MeTube Token Error:', error);
      return {
        hasAccess: false,
        reason: 'Erreur lors de la génération du token'
      };
    }
  }

  /**
   * Valider un token d'accès MeTube
   */
  async validateToken(token: string): Promise<MeTubeTokenValidation> {
    try {
      ;

      // Vérifier si c'est un token provisoire
      if (token.startsWith('prov_')) {
        const tokenParts = token.split('_');
        if (tokenParts.length === 3) {
          const timestamp = parseInt(tokenParts[2].substring(0, 10), 36);
          const now = Date.now();
          const tokenAge = now - timestamp;
          
          // Token provisoire valide pendant 1 heure
          if (tokenAge < 3600000) {
            ;
            return {
              hasAccess: true,
              userId: tokenParts[1],
              userEmail: 'utilisateur@iahome.fr'
            };
          }
        }
      }

      // Vérifier le token dans la base de données
      const { data: tokenData, error: tokenError } = await supabase
        .from('access_tokens')
        .select('id, created_by, expires_at, is_active, module_name')
        .eq('jwt_token', token)
        .eq('is_active', true)
        .eq('module_name', 'metube')
        .single();

      if (tokenError || !tokenData) {
        ;
        return {
          hasAccess: false,
          reason: 'Token invalide'
        };
      }

      // Vérifier l'expiration
      if (tokenData.expires_at && new Date(tokenData.expires_at) <= new Date()) {
        ;
        return {
          hasAccess: false,
          reason: 'Token expiré'
        };
      }

      // Récupérer les informations utilisateur
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', tokenData.created_by)
        .single();

      ;
      return {
        hasAccess: true,
        userId: tokenData.created_by,
        userEmail: userData?.email || 'utilisateur@iahome.fr'
      };

    } catch (error) {
      console.error('❌ MeTube Token Validation Error:', error);
      return {
        hasAccess: false,
        reason: 'Erreur lors de la validation du token'
      };
    }
  }

  /**
   * Incrémenter le compteur d'utilisation
   */
  async incrementUsage(userId: string): Promise<void> {
    try {
      // Récupérer le compteur actuel
      const { data: currentData, error: fetchError } = await supabase
        .from('user_applications')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('module_id', 'metube')
        .single();

      if (fetchError || !currentData) {
        console.error('❌ MeTube Usage: Erreur récupération compteur', fetchError);
        return;
      }

      // Incrémenter le compteur
      const { error } = await supabase
        .from('user_applications')
        .update({ usage_count: (currentData.usage_count || 0) + 1 })
        .eq('user_id', userId)
        .eq('module_id', 'metube');

      if (error) {
        console.error('❌ MeTube Usage: Erreur incrémentation', error);
      } else {
        ;
      }
    } catch (error) {
      console.error('❌ MeTube Usage Error:', error);
    }
  }
}
