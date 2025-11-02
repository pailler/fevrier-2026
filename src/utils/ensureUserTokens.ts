/**
 * Utilitaire pour vérifier les tokens d'un utilisateur
 * NE CRÉE PAS de tokens automatiquement
 * Les tokens sont créés UNIQUEMENT lors de l'inscription
 * Les utilisateurs sans tokens doivent passer par les achats
 */

export async function ensureUserHasTokens(userId: string, userEmail?: string): Promise<{
  success: boolean;
  tokens: number;
  created: boolean;
  error?: string;
}> {
  try {
    // Appeler l'API pour vérifier les tokens (sans création automatique)
    const response = await fetch(`/api/user-tokens-simple?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erreur lors de la vérification des tokens:', errorData);
      return {
        success: false,
        tokens: 0,
        created: false,
        error: errorData.error || 'Erreur lors de la vérification des tokens'
      };
    }

    const data = await response.json();
    const tokens = data.tokens || data.tokensRemaining || 0;

    // Les tokens ne sont jamais créés automatiquement ici
    // Ils sont créés uniquement lors de l'inscription
    console.log(`✅ Tokens vérifiés pour ${userEmail || userId}: ${tokens} tokens`);

    return {
      success: true,
      tokens: tokens,
      created: false // Jamais créé automatiquement
    };

  } catch (error) {
    console.error('❌ Erreur ensureUserHasTokens:', error);
    return {
      success: false,
      tokens: 0,
      created: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

