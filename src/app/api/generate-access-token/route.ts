import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TOKEN_COSTS } from '@/utils/tokenActionService';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

// Jeton d’accès module : pas d’expiration temporelle (présence + droits = accès).
const ACCESS_TOKEN_EXPIRES_AT_MS = 4102444800000; // ~2100-01-01
const ACCESS_TOKEN_EXP_SEC = Math.floor(ACCESS_TOKEN_EXPIRES_AT_MS / 1000);

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
    sentinellenumerique: 'sentinelle-numerique',
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
          error: `Crédits insuffisants (${currentTokens}/${moduleCost})`,
          code: 'INSUFFICIENT_TOKENS',
          tokensRemaining: currentTokens,
          tokensRequired: moduleCost,
          pricingUrl: 'https://iahome.fr/pricing2',
        },
        { status: 400 }
      );
    }

    const newTokenCount = currentTokens - moduleCost;
    const now = new Date().toISOString();

    const { error: tokenUpdateError } = await supabaseAdmin
      .from('user_tokens')
      .update({
        tokens: newTokenCount,
        updated_at: now,
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

    // Enregistrer la visite dans user_applications pour "Applis visitées"
    try {
      const { data: existingApp } = await supabaseAdmin
        .from('user_applications')
        .select('id, usage_count')
        .eq('user_id', userId)
        .eq('module_id', normalizedModuleId)
        .maybeSingle();

      if (existingApp) {
        await supabaseAdmin
          .from('user_applications')
          .update({
            usage_count: (existingApp.usage_count || 0) + 1,
            last_used_at: now,
            updated_at: now,
          })
          .eq('id', existingApp.id);
      } else {
        const moduleTitle = normalizedModuleId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        await supabaseAdmin
          .from('user_applications')
          .insert({
            user_id: userId,
            module_id: normalizedModuleId,
            module_title: moduleTitle,
            usage_count: 1,
            last_used_at: now,
            is_active: false,
            created_at: now,
            updated_at: now,
          });
      }
    } catch (usageErr) {
      console.warn('⚠️ Enregistrement visite generate-access-token:', usageErr);
    }

    // Enregistrer dans token_usage pour l'historique des consommations
    try {
      await supabaseAdmin.from('token_usage').insert({
        user_id: userId,
        module_id: normalizedModuleId,
        module_name: normalizedModuleId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        tokens_consumed: moduleCost,
        usage_date: now,
        action_type: 'module_usage',
      });
    } catch {
      // token_usage peut être indisponible
    }

    const tokenPayload = {
      userId,
      userEmail,
      moduleId: normalizedModuleId,
      moduleTitle: normalizedModuleId.charAt(0).toUpperCase() + normalizedModuleId.slice(1),
      accessLevel: 'premium',
      expiresAt: ACCESS_TOKEN_EXPIRES_AT_MS,
      permissions: ['read', 'access', 'write', 'advanced_features'],
      issuedAt: Date.now(),
      iat: Math.floor(Date.now() / 1000),
      exp: ACCESS_TOKEN_EXP_SEC
    };

    // Token Base64 URL-safe (+ et / remplacés) pour éviter corruption dans l'URL
    const json = JSON.stringify(tokenPayload);
    const base64 = Buffer.from(json, 'utf8').toString('base64');
    const token = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

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
