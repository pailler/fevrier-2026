// Configuration des coûts en tokens pour chaque application
export const TOKEN_COSTS = {
  // Applications IA (100 tokens)
  'whisper': 100,
  'stablediffusion': 100,
  'ruinedfooocus': 100,
  'comfyui': 100,
  'hunyuan3d': 100,
  'prompt-generator': 100,
  'ai-detector': 100,
  'ia-generator': 100, // Alias pour ai-detector
  
  // Applications essentielles (10 tokens)
  'metube': 10,
  'librespeed': 10,
  'psitransfer': 10,
  'pdf': 10,
  'meeting-reports': 100,
  'cogstudio': 10,
  'code-learning': 10,
  'apprendre-autrement': 10,
  'administration': 10,
  
  // Applications premium (100 tokens)
  'qrcodes': 100,
  'home-assistant': 100,
  'voice-isolation': 100
} as const;

export type ModuleId = keyof typeof TOKEN_COSTS;

export interface TokenConsumptionResult {
  success: boolean;
  tokensConsumed: number;
  tokensRemaining: number;
  reason?: string;
  pricingUrl?: string;
}

// Mapping des alias vers les IDs de modules réels
const MODULE_ID_ALIASES: { [key: string]: keyof typeof TOKEN_COSTS } = {
  'ia-generator': 'ai-detector',
  'ia_generator': 'ai-detector',
  'iagenerator': 'ai-detector',
  'ai-detector': 'ai-detector',
  'aidetector': 'ai-detector',
};

export class TokenActionService {
  private static instance: TokenActionService;

  public static getInstance(): TokenActionService {
    if (!TokenActionService.instance) {
      TokenActionService.instance = new TokenActionService();
    }
    return TokenActionService.instance;
  }

  // Normaliser l'ID du module (gérer les alias)
  private normalizeModuleId(moduleId: string): keyof typeof TOKEN_COSTS | null {
    const normalized = moduleId.toLowerCase().trim();
    
    // Vérifier d'abord les alias
    if (MODULE_ID_ALIASES[normalized]) {
      return MODULE_ID_ALIASES[normalized];
    }
    
    // Vérifier si c'est directement dans TOKEN_COSTS
    if (normalized in TOKEN_COSTS) {
      return normalized as keyof typeof TOKEN_COSTS;
    }
    
    return null;
  }

  async checkAndConsumeTokens(
    userId: string,
    moduleId: ModuleId | string,
    action: string,
    moduleTitle: string
  ): Promise<TokenConsumptionResult> {
    try {
      // Normaliser l'ID du module pour gérer les alias
      const normalizedModuleId = this.normalizeModuleId(moduleId as string);
      
      if (!normalizedModuleId) {
        return {
          success: false,
          tokensConsumed: 0,
          tokensRemaining: 0,
          reason: `Module ${moduleId} non trouvé. Modules disponibles: ${Object.keys(TOKEN_COSTS).join(', ')}`
        };
      }
      
      const cost = TOKEN_COSTS[normalizedModuleId];
      if (!cost) {
        return {
          success: false,
          tokensConsumed: 0,
          tokensRemaining: 0,
          reason: `Module ${moduleId} non trouvé`
        };
      }

      // Appel à l'API pour consommer les tokens
      const response = await fetch('/api/user-tokens-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          tokensToConsume: cost,
          moduleId: normalizedModuleId, // Utiliser l'ID normalisé
          moduleName: moduleTitle,
          action: `${normalizedModuleId}.${action}`,
          description: `Accès à ${moduleTitle}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          tokensConsumed: 0,
          tokensRemaining: 0,
          reason: errorData.message || 'Plus de tokens ? Rechargez',
          pricingUrl: errorData.pricingUrl || 'https://iahome.fr/pricing'
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        tokensConsumed: cost,
        tokensRemaining: data.tokensRemaining || 0
      };

    } catch (error) {
      console.error('Erreur TokenActionService:', error);
      return {
        success: false,
        tokensConsumed: 0,
        tokensRemaining: 0,
        reason: 'Erreur de connexion'
      };
    }
  }
}