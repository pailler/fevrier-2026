import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TOKEN_COSTS } from '@/utils/tokenActionService';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

// Durée maximale de session : 1 heure pour tous les utilisateurs (même admin)
const TOKEN_DURATION_MS = 60 * 60 * 1000; // 60 minutes (1 heure)
const TOKEN_DURATION_SECONDS = Math.floor(TOKEN_DURATION_MS / 1000);

const supabaseAdmin = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

function normalizeModuleId(moduleId: string): string {
  const raw = (moduleId || '').trim().toLowerCase();
  const aliases: Record<string, string> = {
    animaginexl: 'animagine-xl',
    florence2: 'florence-2',
    homeassistant: 'home-assistant',
    ia_generator: 'ai-detector',
    iagenerator: 'ai-detector',
  };
  return aliases[raw] || raw;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const cleanBody = body.replace(/\\"/g, '"');
    const { userId, userEmail, moduleId } = JSON.parse(cleanBody);

    if (!userId || !userEmail || !moduleId) {
      return NextResponse.json(
        { error: 'userId, userEmail et moduleId sont requis' },
        { status: 400 }
      );
    }

    const normalizedModuleId = normalizeModuleId(moduleId);
    const moduleCost = TOKEN_COSTS[normalizedModuleId as keyof typeof TOKEN_COSTS] ?? 10;

    // Décompte systématique des tokens à chaque accès direct
    const { data: tokenRow, error: tokenFetchError } = await supabaseAdmin
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', userId)
      .single();

    if (tokenFetchError || !tokenRow) {
      return NextResponse.json(
        {
          error: 'Solde de tokens introuvable',
          code: 'TOKENS_NOT_FOUND',
        },
        { status: 400 }
      );
    }

    const currentTokens = Number(tokenRow.tokens || 0);
    if (currentTokens < moduleCost) {
      return NextResponse.json(
        {
          error: `Tokens insuffisants (${currentTokens}/${moduleCost})`,
          code: 'INSUFFICIENT_TOKENS',
          tokensRemaining: currentTokens,
          tokensRequired: moduleCost,
          pricingUrl: 'https://iahome.fr/pricing2',
        },
        { status: 400 }
      );
    }

    const newTokenCount = currentTokens - moduleCost;
    const { error: tokenUpdateError } = await supabaseAdmin
      .from('user_tokens')
      .update({
        tokens: newTokenCount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (tokenUpdateError) {
      return NextResponse.json(
        {
          error: 'Erreur lors du débit des tokens',
          code: 'TOKENS_UPDATE_FAILED',
        },
        { status: 500 }
      );
    }

    // Durée du token : 1 heure pour tous les utilisateurs
    const tokenDuration = TOKEN_DURATION_MS;
    const tokenDurationSeconds = TOKEN_DURATION_SECONDS;

    // Créer un token simple (Base64)
    const tokenPayload = {
      userId,
      userEmail,
      moduleId: normalizedModuleId,
      moduleTitle: normalizedModuleId.charAt(0).toUpperCase() + normalizedModuleId.slice(1),
      accessLevel: 'premium',
      expiresAt: Date.now() + tokenDuration,
      permissions: ['read', 'access', 'write', 'advanced_features'],
      issuedAt: Date.now(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + tokenDurationSeconds
    };

    const token = btoa(JSON.stringify(tokenPayload));

    // Retourner l'URL du proxy sécurisé
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const secureProxyUrl = `${baseUrl}/api/secure-proxy?token=${token}&module=${normalizedModuleId}`;
    
    return NextResponse.json({
      success: true,
      token,
      moduleId: normalizedModuleId,
      moduleTitle: tokenPayload.moduleTitle,
      cost: moduleCost,
      tokensConsumed: moduleCost,
      tokensRemaining: newTokenCount,
      url: secureProxyUrl,
      expiresAt: tokenPayload.expiresAt
    });

  } catch (error) {
    console.error('Erreur génération token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
