import { supabase } from './supabaseClient';

export interface TokenActionResult {
  success: boolean;
  reason?: string;
  tokensRemaining?: number;
  tokensConsumed?: number;
}

export interface ActionCost {
  [actionType: string]: number;
}

export interface ModuleActionCosts {
  [moduleId: string]: ActionCost;
}

export class TokenActionService {
  private static instance: TokenActionService;

  // Coûts par action pour chaque application
  private static readonly ACTION_COSTS: ModuleActionCosts = {
    metube: {
      download: 1,        // 1 token par téléchargement
      convert: 2,         // 2 tokens par conversion
      batch_download: 5,  // 5 tokens pour téléchargement multiple
      playlist: 3         // 3 tokens pour playlist
    },
    pdf: {
      convert: 1,         // 1 token par conversion
      merge: 2,           // 2 tokens pour fusion
      split: 1,           // 1 token pour division
      compress: 1,        // 1 token pour compression
      ocr: 2              // 2 tokens pour OCR
    },
    qrcodes: {
      generate: 1,        // 1 token par QR code
      batch_generate: 3,  // 3 tokens pour génération multiple
      custom_design: 2,   // 2 tokens pour design personnalisé
      analytics: 1         // 1 token pour analytics
    },
    librespeed: {
      test: 1             // 1 token par test de vitesse
    },
    psitransfer: {
      upload: 1,          // 1 token par upload
      download: 1,        // 1 token par téléchargement
      share: 1            // 1 token par partage
    }
  };

  public static getInstance(): TokenActionService {
    if (!TokenActionService.instance) {
      TokenActionService.instance = new TokenActionService();
    }
    return TokenActionService.instance;
  }

  /**
   * Obtenir le coût d'une action pour un module
   */
  public static getActionCost(moduleId: string, actionType: string): number {
    return this.ACTION_COSTS[moduleId]?.[actionType] || 1;
  }

  /**
   * Obtenir tous les coûts d'actions pour un module
   */
  public static getModuleActionCosts(moduleId: string): ActionCost {
    return this.ACTION_COSTS[moduleId] || {};
  }

  /**
   * Vérifier si l'utilisateur a assez de tokens pour une action
   */
  public async checkTokensAvailable(
    userId: string, 
    moduleId: string, 
    actionType: string
  ): Promise<TokenActionResult> {
    try {
      const requiredTokens = TokenActionService.getActionCost(moduleId, actionType);
      
      console.log(`🔍 Token Check: ${moduleId}/${actionType} - Requis: ${requiredTokens}`);

      // Récupérer les tokens de l'utilisateur
      const { data: userTokens, error: tokenError } = await supabase
        .from('user_tokens')
        .select('tokens')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (tokenError && tokenError.code !== 'PGRST116') {
        console.error('❌ Token Check Error:', tokenError);
        return {
          success: false,
          reason: 'Erreur lors de la récupération des tokens'
        };
      }

      const currentTokens = userTokens?.tokens || 0;

      if (currentTokens < requiredTokens) {
        return {
          success: false,
          reason: `Tokens insuffisants. Requis: ${requiredTokens}, Disponible: ${currentTokens}`,
          tokensRemaining: currentTokens,
          tokensConsumed: 0
        };
      }

      return {
        success: true,
        tokensRemaining: currentTokens,
        tokensConsumed: requiredTokens
      };

    } catch (error) {
      console.error('❌ Token Check Error:', error);
      return {
        success: false,
        reason: 'Erreur lors de la vérification des tokens'
      };
    }
  }

  /**
   * Consommer des tokens pour une action
   */
  public async consumeTokens(
    userId: string, 
    moduleId: string, 
    actionType: string,
    success: boolean = true
  ): Promise<TokenActionResult> {
    try {
      if (!success) {
        console.log('⚠️ Action échouée, pas de consommation de tokens');
        return { success: true, tokensConsumed: 0 };
      }

      const requiredTokens = TokenActionService.getActionCost(moduleId, actionType);
      
      console.log(`💰 Token Consumption: ${moduleId}/${actionType} - ${requiredTokens} tokens`);

      // Vérifier d'abord les tokens disponibles
      const checkResult = await this.checkTokensAvailable(userId, moduleId, actionType);
      if (!checkResult.success) {
        return checkResult;
      }

      // Consommer les tokens
      const { data: userTokens, error: tokenError } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (tokenError && tokenError.code !== 'PGRST116') {
        console.error('❌ Token Consumption Error:', tokenError);
        return {
          success: false,
          reason: 'Erreur lors de la récupération des tokens'
        };
      }

      const currentTokens = userTokens?.tokens || 0;
      const newTokenCount = currentTokens - requiredTokens;

      // Mettre à jour les tokens
      const { error: updateError } = await supabase
        .from('user_tokens')
        .upsert([
          {
            user_id: userId,
            tokens: newTokenCount,
            package_name: userTokens?.package_name || 'Unknown',
            purchase_date: userTokens?.purchase_date || new Date().toISOString(),
            is_active: true
          }
        ], {
          onConflict: 'user_id'
        });

      if (updateError) {
        console.error('❌ Token Update Error:', updateError);
        return {
          success: false,
          reason: 'Erreur lors de la mise à jour des tokens'
        };
      }

      // Enregistrer l'utilisation des tokens
      const { error: usageError } = await supabase
        .from('token_usage')
        .insert([
          {
            user_id: userId,
            module_id: moduleId,
            module_name: moduleId.charAt(0).toUpperCase() + moduleId.slice(1),
            action_type: actionType,
            tokens_consumed: requiredTokens,
            usage_date: new Date().toISOString()
          }
        ]);

      if (usageError) {
        console.error('⚠️ Token Usage Log Error:', usageError);
        // Ne pas faire échouer la transaction pour cette erreur
      }

      console.log(`✅ Tokens consommés: ${requiredTokens}, Restants: ${newTokenCount}`);

      return {
        success: true,
        tokensRemaining: newTokenCount,
        tokensConsumed: requiredTokens
      };

    } catch (error) {
      console.error('❌ Token Consumption Error:', error);
      return {
        success: false,
        reason: 'Erreur lors de la consommation des tokens'
      };
    }
  }

  /**
   * Obtenir le solde de tokens d'un utilisateur
   */
  public async getUserTokenBalance(userId: string): Promise<number> {
    try {
      const { data: userTokens, error } = await supabase
        .from('user_tokens')
        .select('tokens')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Token Balance Error:', error);
        return 0;
      }

      return userTokens?.tokens || 0;
    } catch (error) {
      console.error('❌ Token Balance Error:', error);
      return 0;
    }
  }

  /**
   * Obtenir l'historique d'utilisation des tokens
   */
  public async getUserTokenHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data: history, error } = await supabase
        .from('token_usage')
        .select('*')
        .eq('user_id', userId)
        .order('usage_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Token History Error:', error);
        return [];
      }

      return history || [];
    } catch (error) {
      console.error('❌ Token History Error:', error);
      return [];
    }
  }
}
