// Version côté client du TokenActionService pour éviter les problèmes d'import
export class TokenActionServiceClient {
  private static instance: TokenActionServiceClient;

  public static getInstance(): TokenActionServiceClient {
    if (!TokenActionServiceClient.instance) {
      TokenActionServiceClient.instance = new TokenActionServiceClient();
    }
    return TokenActionServiceClient.instance;
  }

  /**
   * Obtenir le solde de tokens d'un utilisateur via API
   */
  public async getUserTokenBalance(userId: string): Promise<number> {
    try {
      const response = await fetch(`/api/user-tokens-simple?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data.tokens || 0;
      }
      return 0;
    } catch (error) {
      console.error('❌ Token Balance Error:', error);
      return 0;
    }
  }

  /**
   * Obtenir l'historique d'utilisation des tokens via API
   */
  public async getUserTokenHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(`/api/token-info?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data.tokenHistory || [];
      }
      return [];
    } catch (error) {
      console.error('❌ Token History Error:', error);
      return [];
    }
  }

  /**
   * Obtenir le coût d'une action
   */
  private getActionCost(moduleId: string, actionType: string): number {
    const costs: { [key: string]: { [key: string]: number } } = {
      // Modules IA : 100 tokens
      stablediffusion: {
        access: 100,           // 100 tokens pour accéder à StableDiffusion
        generate: 100,         // 100 tokens par génération d'image
        batch_generate: 200    // 200 tokens pour génération multiple
      },
      comfyui: {
        access: 100,           // 100 tokens pour accéder à ComfyUI
        workflow: 100,         // 100 tokens par workflow
        batch_process: 200     // 200 tokens pour traitement multiple
      },
      whisper: {
        access: 100,           // 100 tokens pour accéder à Whisper
        transcribe: 100,       // 100 tokens par transcription
        batch_transcribe: 200  // 200 tokens pour transcription multiple
      },
      cogstudio: {
        access: 100,           // 100 tokens pour accéder à CogStudio
        generate: 100,         // 100 tokens par génération
        batch_generate: 200    // 200 tokens pour génération multiple
      },
      ruinedfooocus: {
        access: 100,           // 100 tokens pour accéder à RuinedFooocus
        generate: 100,         // 100 tokens par génération
        batch_generate: 200    // 200 tokens pour génération multiple
      },
      
      // Modules essentiels : 10 tokens
      metube: {
        access: 10,         // 10 tokens pour accéder à MeTube
        download: 10,       // 10 tokens par téléchargement
        convert: 20,        // 20 tokens par conversion
        batch_download: 50, // 50 tokens pour téléchargement multiple
        playlist: 30        // 30 tokens pour playlist
      },
      pdf: {
        access: 10,           // 10 tokens pour accéder à PDF+
        convert: 1,            // 1 token par conversion
        merge: 2,              // 2 tokens pour fusion
        split: 1,              // 1 token pour division
        compress: 1,            // 1 token pour compression
        ocr: 2                 // 2 tokens pour OCR
      },
      qrcodes: {
        access: 10,            // 10 tokens pour accéder aux QR Codes
        generate: 1,           // 1 token par QR code
        batch_generate: 3,     // 3 tokens pour génération multiple
        custom_design: 2,      // 2 tokens pour design personnalisé
        analytics: 1           // 1 token pour analytics
      },
      librespeed: {
        access: 10,            // 10 tokens pour accéder à LibreSpeed
        test: 10               // 10 tokens par test de vitesse
      },
      psitransfer: {
        access: 10,            // 10 tokens pour accéder à PsiTransfer
        upload: 1,             // 1 token par upload
        download: 1,           // 1 token par téléchargement
        share: 1               // 1 token par partage
      }
    };

    return costs[moduleId]?.[actionType] || 1;
  }

  /**
   * Vérifier et consommer des tokens via API
   */
  public async checkAndConsumeTokens(
    userId: string,
    moduleId: string,
    actionType: string,
    userEmail: string
  ): Promise<{ success: boolean; reason?: string; tokensRemaining?: number; tokensConsumed?: number }> {
    try {
      const tokensToConsume = this.getActionCost(moduleId, actionType);
      
      const response = await fetch('/api/user-tokens-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tokensToConsume,
          moduleId,
          moduleName: moduleId,
          userEmail
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, reason: error.error || 'Erreur inconnue', tokensRemaining: error.currentTokens };
      }

      const result = await response.json();
      return {
        success: true,
        tokensRemaining: result.tokensRemaining,
        tokensConsumed: result.tokensConsumed
      };
    } catch (error) {
      console.error('❌ Token Check Error:', error);
      return { success: false, reason: 'Erreur de connexion' };
    }
  }
}
