/**
 * Utilitaire pour vérifier les crédits d'un utilisateur
 * NE CRÉE PAS de crédits automatiquement
 * Les crédits sont créés UNIQUEMENT lors de l'inscription
 * Les utilisateurs sans crédits doivent passer par les achats
 */

export async function ensureUserHasTokens(userId: string, userEmail?: string): Promise<{
  success: boolean;
  tokens: number;
  created: boolean;
  error?: string;
}> {
  try {
    // Appeler l'API pour vérifier les crédits (sans création automatique)
    const response = await fetch(`/api/user-tokens-simple?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erreur lors de la vérification des crédits:', errorData);
      return {
        success: false,
        tokens: 0,
        created: false,
        error: errorData.error || 'Erreur lors de la vérification des crédits'
      };
    }

    const data = await response.json();
    const tokens = data.tokens || data.tokensRemaining || 0;

    // Les crédits ne sont jamais créés automatiquement ici
    // Ils sont créés uniquement lors de l'inscription
    console.log(`✅ Crédits vérifiés pour ${userEmail || userId}: ${tokens} crédits`);

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

