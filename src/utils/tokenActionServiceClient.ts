import { TokenActionService, TokenConsumptionResult, ModuleId } from './tokenActionService';

export class TokenActionServiceClient {
  private static instance: TokenActionServiceClient;

  public static getInstance(): TokenActionServiceClient {
    if (!TokenActionServiceClient.instance) {
      TokenActionServiceClient.instance = new TokenActionServiceClient();
    }
    return TokenActionServiceClient.instance;
  }

  async checkAndConsumeTokens(
    userId: string,
    moduleId: ModuleId,
    action: string,
    moduleTitle: string
  ): Promise<TokenConsumptionResult> {
    try {
      const cost = this.getTokenCost(moduleId);
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
      console.error('Erreur TokenActionServiceClient:', error);
      return {
        success: false,
        tokensConsumed: 0,
        tokensRemaining: 0,
        reason: 'Erreur de connexion'
      };
    }
  }

  private getTokenCost(moduleId: ModuleId): number | null {
    const costs: Record<ModuleId, number> = {
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
    };

    return costs[moduleId] || null;
  }

  // Méthode pour récupérer le solde de tokens d'un utilisateur
  async getUserTokenBalance(userId: string): Promise<number> {
    try {
      const response = await fetch(`/api/user-tokens-simple?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Erreur lors de la récupération du solde de tokens');
        return 0;
      }

      const data = await response.json();
      return data.tokensRemaining || 0;

    } catch (error) {
      console.error('Erreur getUserTokenBalance:', error);
      return 0;
    }
  }

  // Méthode pour récupérer l'historique des tokens d'un utilisateur
  async getUserTokenHistory(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const response = await fetch(`/api/user-tokens-simple/history?userId=${userId}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Erreur lors de la récupération de l\'historique des tokens');
        return [];
      }

      const data = await response.json();
      return data.history || [];

    } catch (error) {
      console.error('Erreur getUserTokenHistory:', error);
      return [];
    }
  }
}