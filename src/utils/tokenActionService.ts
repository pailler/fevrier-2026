/** Modules en accès gratuit et illimité (connexion IAHome + JWT obligatoires, sans débit de crédits). */
export const FREE_UNLIMITED_MODULE_IDS = [
  'code-learning',
  'librespeed',
  'pdf',
  'reveil-intelligent',
  'administration',
] as const;

export type FreeUnlimitedModuleId = (typeof FREE_UNLIMITED_MODULE_IDS)[number];

export const FREE_UNLIMITED_ACCESS_LABEL = 'Accès gratuit et illimité';

const FREE_MODULE_ALIASES: Record<string, FreeUnlimitedModuleId> = {
  '1': 'pdf',
  'pdf+': 'pdf',
  apprendrelecode: 'code-learning',
  'apprendre-le-code': 'code-learning',
  'reveil intelligent': 'reveil-intelligent',
};

/** Normalise un ID module et indique s'il est en accès gratuit illimité. */
export function isFreeUnlimitedModule(moduleId: string): boolean {
  const raw = (moduleId || '').trim().toLowerCase();
  const normalized = FREE_MODULE_ALIASES[raw] ?? raw;
  return (FREE_UNLIMITED_MODULE_IDS as readonly string[]).includes(normalized);
}

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
  'sentinelle-numerique': 10, // Sentinelle Numérique -> 10 tokens (cybersécurité, fin de vie numérique)
  'photomaker': 100, // PhotoMaker -> 100 tokens
  'photobooth': 100, // Photobooth -> 100 tokens
  'animagine-xl': 100, // Animagine XL -> 100 tokens
  'florence-2': 100, // Florence-2 -> 100 tokens
  'birefnet': 100, // BiRefNet -> 100 tokens
  'musetalk': 100, // MuseTalk -> lip-sync video
  'photo-vivante': 100, // Photo Vivante -> animation photo realiste
  
  // Applications essentielles
  'metube': 10,
  'librespeed': 0,
  'psitransfer': 10,
  'pdf': 0,
  'meeting-reports': 100,
  'cogstudio': 10,
  'code-learning': 0,
  'apprendre-autrement': 10,
  'administration': 0,
  
  // Applications premium (100 tokens)
  'qrcodes': 100,
  'home-assistant': 100,
  'voice-isolation': 100,
  'tts': 100,
  /** Générateur de CV IA (optimisation ATS) */
  'cv-generator': 100,
  /** Vote en ligne (PIN + QR, Supabase) */
  'vote': 10,
  /** Réveil intelligent (météo, jours fériés) */
  'reveil-intelligent': 0,
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
  'sentinelle-numerique': 'sentinelle-numerique',
  'sentinellenumerique': 'sentinelle-numerique',
};

/** Coût en crédits pour l’affichage UI (fallback 10 si inconnu). */
export function getTokenCostForModuleId(moduleId: string): number {
  const n = moduleId.toLowerCase().trim();
  if (isFreeUnlimitedModule(n)) {
    return 0;
  }
  if (MODULE_ID_ALIASES[n]) {
    return TOKEN_COSTS[MODULE_ID_ALIASES[n]];
  }
  if (n in TOKEN_COSTS) {
    return TOKEN_COSTS[n as keyof typeof TOKEN_COSTS];
  }
  return 10;
}

/** Libellé court : « N crédit(s) ». */
export function formatCreditsAmount(count: number): string {
  return `${count} crédit${count > 1 ? 's' : ''}`;
}

/** Libellé tarif complet affiché sur les fiches modules. */
export function formatCreditsPerAccess(count: number): string {
  return `${formatCreditsAmount(count)} par accès. Utilisez l'application aussi longtemps que vous souhaitez`;
}

/** Libellé tarifaire pour l’UI (boutons, cartes, admin). */
export function getModuleAccessCostLabel(moduleId: string): string {
  if (isFreeUnlimitedModule(moduleId)) {
    return FREE_UNLIMITED_ACCESS_LABEL;
  }
  const cost = getTokenCostForModuleId(moduleId);
  return `${formatCreditsAmount(cost)} par accès`;
}

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
      if (cost === undefined) {
        return {
          success: false,
          tokensConsumed: 0,
          tokensRemaining: 0,
          reason: `Module ${moduleId} non trouvé`
        };
      }

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