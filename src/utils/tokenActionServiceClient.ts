import { TokenConsumptionResult, ModuleId, getTokenCostForModuleId } from './tokenActionService';
type TokenHistoryEntry = Record<string, unknown>;

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
      const cost = getTokenCostForModuleId(moduleId);
      if (cost === 0) {
        return {
          success: true,
          tokensConsumed: 0,
          tokensRemaining: 0,
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
          moduleId: moduleId,
          moduleName: moduleTitle,
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
          reason: errorData.message || 'Plus de crédits ? Rechargez',
          pricingUrl: errorData.pricingUrl || 'https://iahome.fr/pricing2'
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
    const cost = getTokenCostForModuleId(moduleId);
    return cost >= 0 ? cost : null;
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
        // Ne pas logger d'erreur si c'est juste un utilisateur sans tokens (404) - c'est normal
        if (response.status !== 404) {
          console.error('Erreur lors de la récupération du solde de tokens:', response.status, response.statusText);
        }
        return 0;
      }

      const data = await response.json();
      return data.tokensRemaining || data.tokens || 0;

    } catch (error) {
      // Ne pas logger d'erreur pour les erreurs réseau normales
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Erreur réseau silencieuse
        return 0;
      }
      console.error('Erreur getUserTokenBalance:', error);
      return 0;
    }
  }

  // Méthode pour récupérer l'historique des tokens d'un utilisateur (ne rejette jamais)
  async getUserTokenHistory(userId: string, limit: number = 20): Promise<TokenHistoryEntry[]> {
    try {
      const response = await fetch(`/api/user-tokens-simple/history?userId=${userId}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        return [];
      }

      try {
        const data = await response.json();
        return Array.isArray(data?.history) ? data.history : [];
      } catch {
        return [];
      }
    } catch {
      return [];
    }
  }
}