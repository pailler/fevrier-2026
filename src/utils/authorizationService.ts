import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
  moduleData?: any;
  userAccess?: any;
  quotaInfo?: {
    usageCount: number;
    maxUsage: number;
    isQuotaExceeded: boolean;
  };
}

export interface ModuleAccessInfo {
  moduleId: string;
  moduleTitle: string;
  userId: string;
  userEmail: string;
}

export class AuthorizationService {
  private static instance: AuthorizationService;

  public static getInstance(): AuthorizationService {
    if (!AuthorizationService.instance) {
      AuthorizationService.instance = new AuthorizationService();
    }
    return AuthorizationService.instance;
  }

  /**
   * Vérifie si un utilisateur a l'autorisation d'accéder à un module
   */
  async checkModuleAccess(accessInfo: ModuleAccessInfo): Promise<AuthorizationResult> {
    try {
      console.log('🔐 Vérification d\'autorisation pour:', accessInfo);

      // 1. Vérifier que l'utilisateur est connecté
      if (!accessInfo.userId || !accessInfo.userEmail) {
        return {
          authorized: false,
          reason: 'Utilisateur non connecté'
        };
      }

      // 2. Vérifier que le module existe et est visible
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('id, title, category, price, is_visible, url')
        .or(`id.eq.${accessInfo.moduleId},title.ilike.%${accessInfo.moduleTitle}%`)
        .single();

      if (moduleError || !moduleData) {
        return {
          authorized: false,
          reason: 'Module non trouvé'
        };
      }

      if (moduleData.is_visible === false) {
        return {
          authorized: false,
          reason: 'Module non disponible'
        };
      }

      // 3. Vérifier l'accès utilisateur au module
      const { data: userAccess, error: accessError } = await supabase
        .from('user_applications')
        .select(`
          id,
          user_id,
          module_id,
          module_title,
          is_active,
          usage_count,
          max_usage,
          expires_at,
          created_at
        `)
        .eq('user_id', accessInfo.userId)
        .eq('module_id', moduleData.id)
        .eq('is_active', true)
        .single();

      if (accessError || !userAccess) {
        return {
          authorized: false,
          reason: 'Aucun accès trouvé pour ce module'
        };
      }

      // 4. Vérifier l'expiration
      if (userAccess.expires_at) {
        const now = new Date();
        const expiresAt = new Date(userAccess.expires_at);
        
        if (now > expiresAt) {
          return {
            authorized: false,
            reason: 'Module expiré',
            moduleData,
            userAccess
          };
        }
      }

      // 5. Vérifier les quotas
      const quotaInfo = {
        usageCount: userAccess.usage_count || 0,
        maxUsage: userAccess.max_usage || 0,
        isQuotaExceeded: userAccess.max_usage > 0 && (userAccess.usage_count || 0) >= userAccess.max_usage
      };

      if (quotaInfo.isQuotaExceeded) {
        return {
          authorized: false,
          reason: 'Quota d\'utilisation épuisé',
          moduleData,
          userAccess,
          quotaInfo
        };
      }

      // 6. Autorisation accordée
      return {
        authorized: true,
        moduleData,
        userAccess,
        quotaInfo
      };

    } catch (error) {
      console.error('❌ Erreur lors de la vérification d\'autorisation:', error);
      return {
        authorized: false,
        reason: 'Erreur interne du système'
      };
    }
  }

  /**
   * Génère un token d'accès temporaire pour un module
   */
  async generateAccessToken(accessInfo: ModuleAccessInfo, durationMinutes: number = 5): Promise<string | null> {
    try {
      console.log('🔑 Génération d\'un token d\'accès temporaire pour:', accessInfo);

      // Vérifier l'autorisation d'abord
      const authResult = await this.checkModuleAccess(accessInfo);
      if (!authResult.authorized) {
        console.log('❌ Autorisation refusée pour la génération de token:', authResult.reason);
        return null;
      }

      // Pour les modules qui nécessitent un JWT (comme QR Codes), générer un JWT
      if (accessInfo.moduleId === 'qrcodes') {
        const jwtToken = this.generateJWTToken(accessInfo, durationMinutes);
        console.log('✅ Token JWT généré avec succès pour QR Codes');
        return jwtToken;
      }

      // Pour les autres modules, utiliser le système de tokens uniques
      const token = this.generateUniqueToken();
      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

      // Stocker le token en base de données
      const { error: insertError } = await supabase
        .from('librespeed_tokens')
        .insert({
          token,
          user_id: accessInfo.userId,
          user_email: accessInfo.userEmail,
          expires_at: expiresAt.toISOString(),
          is_used: false
        });

      if (insertError) {
        console.error('❌ Erreur lors de l\'insertion du token:', insertError);
        return null;
      }

      console.log('✅ Token généré avec succès:', token);
      return token;

    } catch (error) {
      console.error('❌ Erreur lors de la génération du token:', error);
      return null;
    }
  }

  /**
   * Valide un token d'accès temporaire
   */
  async validateAccessToken(token: string): Promise<{ valid: boolean; userInfo?: any; reason?: string }> {
    try {
      console.log('🔍 Validation du token:', token);

      const { data: tokenData, error } = await supabase
        .from('librespeed_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_used', false)
        .single();

      if (error || !tokenData) {
        return {
          valid: false,
          reason: 'Token invalide ou non trouvé'
        };
      }

      // Vérifier l'expiration
      const now = new Date();
      const expiresAt = new Date(tokenData.expires_at);
      
      if (now > expiresAt) {
        return {
          valid: false,
          reason: 'Token expiré'
        };
      }

      // Marquer le token comme utilisé
      await supabase
        .from('librespeed_tokens')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', tokenData.id);

      return {
        valid: true,
        userInfo: {
          userId: tokenData.user_id,
          userEmail: tokenData.user_email
        }
      };

    } catch (error) {
      console.error('❌ Erreur lors de la validation du token:', error);
      return {
        valid: false,
        reason: 'Erreur interne du système'
      };
    }
  }

  /**
   * Incrémente le compteur d'utilisation d'un module
   */
  async incrementUsageCount(userId: string, moduleId: string): Promise<boolean> {
    try {
      console.log('📊 Incrémentation du compteur d\'utilisation pour:', { userId, moduleId });

      const { data: moduleAccess, error: findError } = await supabase
        .from('user_applications')
        .select('id, usage_count')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .eq('is_active', true)
        .single();

      if (findError || !moduleAccess) {
        console.log('❌ Impossible de trouver l\'accès au module pour incrémenter');
        return false;
      }

      const { error: updateError } = await supabase
        .from('user_applications')
        .update({ 
          usage_count: (moduleAccess.usage_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleAccess.id);

      if (updateError) {
        console.error('❌ Erreur lors de l\'incrémentation:', updateError);
        return false;
      }

      console.log('✅ Compteur d\'utilisation incrémenté avec succès');
      return true;

    } catch (error) {
      console.error('❌ Erreur lors de l\'incrémentation du compteur:', error);
      return false;
    }
  }

  /**
   * Génère un token unique
   */
  private generateUniqueToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Génère un token JWT pour l'authentification
   */
  generateJWTToken(accessInfo: ModuleAccessInfo, durationMinutes: number = 5): string {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const payload = {
      userId: accessInfo.userId,
      userEmail: accessInfo.userEmail,
      moduleId: accessInfo.moduleId,
      moduleTitle: accessInfo.moduleTitle,
      email: accessInfo.userEmail, // Alias pour compatibilité
      sub: accessInfo.userId, // Alias pour compatibilité
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (durationMinutes * 60)
    };
    
    return jwt.sign(payload, secret, { algorithm: 'HS256' });
  }

  /**
   * Nettoie les tokens expirés
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      console.log('🧹 Nettoyage des tokens expirés...');

      const { data, error } = await supabase
        .from('librespeed_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.error('❌ Erreur lors du nettoyage des tokens:', error);
        return 0;
      }

      console.log('✅ Tokens expirés nettoyés');
      return 1; // Indique qu'une opération de nettoyage a été effectuée

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des tokens:', error);
      return 0;
    }
  }
}

export default AuthorizationService;
