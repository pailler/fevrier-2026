import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from './supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
);

export interface ModuleSecurityResult {
  isVisible: boolean;
  hasAccess: boolean;
  moduleId?: string;
  moduleTitle?: string;
  reason?: string;
}

/**
 * Service centralisé pour la sécurité des modules
 * Vérifie si un module apparaît dans /account pour un utilisateur donné
 */
export class ModuleSecurityService {
  private static instance: ModuleSecurityService;

  public static getInstance(): ModuleSecurityService {
    if (!ModuleSecurityService.instance) {
      ModuleSecurityService.instance = new ModuleSecurityService();
    }
    return ModuleSecurityService.instance;
  }

  /**
   * Vérifie si un module apparaît dans /account pour un utilisateur
   * @param userId - ID de l'utilisateur
   * @param moduleIdentifier - ID ou nom du module à vérifier
   * @returns ModuleSecurityResult avec les détails de la vérification
   */
  async checkModuleVisibilityInEncours(
    userId: string, 
    moduleIdentifier: string
  ): Promise<ModuleSecurityResult> {
    try {
      console.log(`🔍 ModuleSecurityService: Vérification module ${moduleIdentifier} dans /account pour utilisateur:`, userId);
      
      // 1. Trouver le module dans la base de données
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('id, title, category, price, is_visible')
        .or(`id.eq.${moduleIdentifier},title.ilike.%${moduleIdentifier}%`)
        .single();

      if (moduleError || !moduleData) {
        console.log(`❌ ModuleSecurityService: Module ${moduleIdentifier} non trouvé dans la base de données`);
        return {
          isVisible: false,
          hasAccess: false,
          reason: `Module ${moduleIdentifier} non trouvé`
        };
      }

      // 2. Vérifier que le module est visible (apparaît dans /account)
      if (moduleData.is_visible === false) {
        console.log(`❌ ModuleSecurityService: Module ${moduleIdentifier} masqué dans /account`);
        return {
          isVisible: false,
          hasAccess: false,
          moduleId: moduleData.id,
          moduleTitle: moduleData.title,
          reason: `Module ${moduleIdentifier} masqué dans /account`
        };
      }

      // 3. Vérifier que l'utilisateur a un accès actif au module
      const { data: userAccess, error: accessError } = await supabase
        .from('user_applications')
        .select('id, is_active, module_title')
        .eq('user_id', userId)
        .eq('module_id', moduleData.id)
        .eq('is_active', true)
        .single();

      if (accessError || !userAccess) {
        console.log(`❌ ModuleSecurityService: Aucun accès utilisateur trouvé pour ${moduleIdentifier}`);
        return {
          isVisible: true,
          hasAccess: false,
          moduleId: moduleData.id,
          moduleTitle: moduleData.title,
          reason: `Aucun accès utilisateur pour ${moduleIdentifier}`
        };
      }

      // 4. Vérifier les tokens d'accès créés manuellement
      const { data: tokenAccess, error: tokenError } = await supabase
        .from('access_tokens')
        .select('id, is_active, expires_at, module_name')
        .eq('created_by', userId)
        .eq('is_active', true)
        .or(`module_name.ilike.%${moduleIdentifier}%,module_id.eq.${moduleData.id}`)
        .limit(1);

      // Si pas d'accès via user_applications mais qu'il y a un token valide
      if (!userAccess && tokenAccess && tokenAccess.length > 0) {
        const token = tokenAccess[0];
        
        // Vérifier l'expiration du token
        if (token.expires_at) {
          const tokenExpirationDate = new Date(token.expires_at);
          const now = new Date();
          
          if (tokenExpirationDate <= now) {
            console.log(`❌ ModuleSecurityService: Token expiré pour ${moduleIdentifier}`);
            return {
              isVisible: true,
              hasAccess: false,
              moduleId: moduleData.id,
              moduleTitle: moduleData.title,
              reason: `Token expiré pour ${moduleIdentifier}`
            };
          }
        }

        console.log(`✅ ModuleSecurityService: Accès via token valide pour ${moduleIdentifier}`);
        return {
          isVisible: true,
          hasAccess: true,
          moduleId: moduleData.id,
          moduleTitle: moduleData.title
        };
      }

      console.log(`✅ ModuleSecurityService: Module ${moduleIdentifier} visible dans /account pour l'utilisateur`);
      return {
        isVisible: true,
        hasAccess: true,
        moduleId: moduleData.id,
        moduleTitle: moduleData.title
      };

    } catch (error) {
      console.error(`❌ ModuleSecurityService: Erreur vérification module /account pour ${moduleIdentifier}:`, error);
      return {
        isVisible: false,
        hasAccess: false,
        reason: `Erreur lors de la vérification: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }

  /**
   * Vérifie si un utilisateur peut accéder à une application externe
   * @param userId - ID de l'utilisateur
   * @param moduleIdentifier - ID ou nom du module
   * @returns true si l'utilisateur peut accéder, false sinon
   */
  async canAccessExternalApp(userId: string, moduleIdentifier: string): Promise<boolean> {
    const result = await this.checkModuleVisibilityInEncours(userId, moduleIdentifier);
    return result.isVisible && result.hasAccess;
  }

  /**
   * Obtient la raison du refus d'accès
   * @param userId - ID de l'utilisateur
   * @param moduleIdentifier - ID ou nom du module
   * @returns string avec la raison du refus
   */
  async getAccessDenialReason(userId: string, moduleIdentifier: string): Promise<string> {
    const result = await this.checkModuleVisibilityInEncours(userId, moduleIdentifier);
    return result.reason || 'Accès refusé';
  }
}

export default ModuleSecurityService;



