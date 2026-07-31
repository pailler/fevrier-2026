import { createClient, SupabaseClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { TOKEN_COSTS, isFreeUnlimitedModule } from '@/utils/tokenActionService';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const JWT_SECRET = process.env.JWT_SECRET || 'iahome-jwt-secret-2024-production-secure-key';
const ACCESS_TOKEN_EXPIRES_AT_MS = 4102444800000;
const ACCESS_TOKEN_EXP_SEC = Math.floor(ACCESS_TOKEN_EXPIRES_AT_MS / 1000);

let _admin: SupabaseClient | null = null;

function supabaseAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());
  }
  return _admin;
}

export function normalizeModuleIdForAccessJwt(moduleId: string): string {
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

export type IssueModuleAccessJwtResult =
  | {
      ok: true;
      token: string;
      normalizedModuleId: string;
      moduleCost: number;
      tokensRemaining: number;
    }
  | {
      ok: false;
      code: 'TOKENS_NOT_FOUND' | 'INSUFFICIENT_TOKENS' | 'TOKENS_UPDATE_FAILED' | 'BAD_INPUT';
      error: string;
      tokensRemaining?: number;
      tokensRequired?: number;
    };

/**
 * Débite les crédits, enregistre l’usage, signe le JWT (même logique que POST /api/generate-access-token).
 * Utilisable depuis unified-redirect pour ajouter ?token= sur les sous-domaines protégés (worker Cloudflare).
 */
export async function issueModuleAccessJwtWithDebit(params: {
  userId: string;
  userEmail: string;
  moduleId: string;
}): Promise<IssueModuleAccessJwtResult> {
  const { userId, userEmail, moduleId } = params;
  if (!userId || !userEmail || !moduleId) {
    return { ok: false, code: 'BAD_INPUT', error: 'userId, userEmail et moduleId sont requis' };
  }

  const normalizedModuleId = normalizeModuleIdForAccessJwt(moduleId);
  const moduleCost = isFreeUnlimitedModule(normalizedModuleId)
    ? 0
    : (TOKEN_COSTS[normalizedModuleId as keyof typeof TOKEN_COSTS] ?? 10);
  const admin = supabaseAdmin();

  let currentTokens = 0;
  let newTokenCount = 0;

  if (moduleCost > 0) {
    const { data: tokenRow, error: tokenFetchError } = await admin
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', userId)
      .single();

    if (tokenFetchError || !tokenRow) {
      return {
        ok: false,
        code: 'TOKENS_NOT_FOUND',
        error: 'Solde de crédits introuvable',
      };
    }

    currentTokens = Number(tokenRow.tokens || 0);
    if (currentTokens < moduleCost) {
      return {
        ok: false,
        code: 'INSUFFICIENT_TOKENS',
        error: `Crédits insuffisants (${currentTokens}/${moduleCost})`,
        tokensRemaining: currentTokens,
        tokensRequired: moduleCost,
      };
    }

    newTokenCount = currentTokens - moduleCost;
    const nowDebit = new Date().toISOString();

    const { error: tokenUpdateError } = await admin
      .from('user_tokens')
      .update({
        tokens: newTokenCount,
        updated_at: nowDebit,
      })
      .eq('user_id', userId);

    if (tokenUpdateError) {
      return {
        ok: false,
        code: 'TOKENS_UPDATE_FAILED',
        error: 'Erreur lors du débit des crédits',
      };
    }
  } else {
    try {
      const { data: tokenRow } = await admin
        .from('user_tokens')
        .select('tokens')
        .eq('user_id', userId)
        .maybeSingle();
      currentTokens = Number(tokenRow?.tokens || 0);
      newTokenCount = currentTokens;
    } catch {
      // Solde optionnel pour les modules gratuits
    }
  }

  const now = new Date().toISOString();

  try {
    const { data: existingApp } = await admin
      .from('user_applications')
      .select('id, usage_count')
      .eq('user_id', userId)
      .eq('module_id', normalizedModuleId)
      .maybeSingle();

    if (existingApp) {
      await admin
        .from('user_applications')
        .update({
          usage_count: (existingApp.usage_count || 0) + 1,
          last_used_at: now,
          updated_at: now,
          is_active: true,
        })
        .eq('id', existingApp.id);
    } else {
      const moduleTitle = normalizedModuleId
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
      await admin.from('user_applications').insert({
        user_id: userId,
        module_id: normalizedModuleId,
        module_title: moduleTitle,
        usage_count: 1,
        last_used_at: now,
        is_active: true,
        created_at: now,
        updated_at: now,
      });
    }
  } catch (usageErr) {
    console.warn('⚠️ Enregistrement visite issueModuleAccessJwtWithDebit:', usageErr);
  }

  if (moduleCost > 0) {
    try {
      await admin.from('token_usage').insert({
        user_id: userId,
        module_id: normalizedModuleId,
        module_name: normalizedModuleId
          .split('-')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' '),
        tokens_consumed: moduleCost,
        usage_date: now,
        action_type: 'module_usage',
      });
    } catch {
      // token_usage peut être indisponible
    }
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
    exp: ACCESS_TOKEN_EXP_SEC,
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { algorithm: 'HS256' });

  return {
    ok: true,
    token,
    normalizedModuleId,
    moduleCost,
    tokensRemaining: newTokenCount,
  };
}
