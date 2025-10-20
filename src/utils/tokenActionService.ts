// Configuration des coûts en tokens pour chaque application
export const TOKEN_COSTS = {
  // Applications IA (100 tokens)
  'whisper': 100,
  'stablediffusion': 100,
  'ruinedfooocus': 100,
  'comfyui': 100,
  
  // Applications essentielles (10 tokens)
  'metube': 10,
  'librespeed': 10,
  'psitransfer': 10,
  'qrcodes': 100,
  'pdf': 10,
  'meeting-reports': 10,
  'cogstudio': 10
} as const;

export type ModuleId = keyof typeof TOKEN_COSTS;

export interface TokenConsumptionResult {
  success: boolean;
  tokensConsumed: number;
  tokensRemaining: number;
  reason?: string;
}

export class TokenActionService {
  private static instance: TokenActionService;

  public static getInstance(): TokenActionService {
    if (!TokenActionService.instance) {
      TokenActionService.instance = new TokenActionService();
    }
    return TokenActionService.instance;
  }

  async checkAndConsumeTokens(
    userId: string,
    moduleId: ModuleId,
    action: string,
    moduleTitle: string
  ): Promise<TokenConsumptionResult> {
    try {
      const cost = TOKEN_COSTS[moduleId];
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
          action: `${moduleId}.${action}`,
          description: `Accès à ${moduleTitle}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          tokensConsumed: 0,
          tokensRemaining: 0,
          reason: errorData.message || 'Erreur lors de la consommation des tokens'
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