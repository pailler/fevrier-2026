import type { Session } from '@supabase/supabase-js';
import { getPostLoginRedirect } from './loginRedirect';
import { getSupabaseClient } from './supabaseService';

export type OAuthCallbackResult =
  | { ok: true; session: Session }
  | { ok: false; error: string; code?: string };

/**
 * Échange le code OAuth (PKCE) contre une session Supabase.
 * Un seul appel — évite les courses avec detectSessionInUrl.
 */
export async function completeOAuthFromUrl(): Promise<OAuthCallbackResult> {
  if (typeof window === 'undefined') {
    return { ok: false, error: 'Environnement navigateur requis' };
  }

  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get('error');
  const oauthErrorDescription = params.get('error_description');

  if (oauthError) {
    return {
      ok: false,
      error: oauthErrorDescription || oauthError,
      code: oauthError,
    };
  }

  const authCode = params.get('code');
  const client = getSupabaseClient();

  if (authCode) {
    const { data, error } = await client.auth.exchangeCodeForSession(authCode);

    if (error) {
      return {
        ok: false,
        error: error.message || 'Échec de l’échange OAuth',
        code: error.name,
      };
    }

    if (!data.session?.user) {
      return { ok: false, error: 'Session vide après échange OAuth' };
    }

    stripOAuthParamsFromUrl();
    return { ok: true, session: data.session };
  }

  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError) {
    return { ok: false, error: sessionError.message || 'Session introuvable' };
  }
  if (!session?.user) {
    return { ok: false, error: 'Aucune session active' };
  }

  return { ok: true, session };
}

/** Retire code/state de l’URL (le code OAuth est à usage unique). */
export function stripOAuthParamsFromUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    const qs = url.searchParams.toString();
    const clean = url.pathname + (qs ? `?${qs}` : '') + url.hash;
    window.history.replaceState(null, '', clean);
  } catch {
    // ignore
  }
}

/** Page de retour après OAuth (param URL puis sessionStorage). */
export function consumePostLoginRedirect(searchParams: URLSearchParams | null): string {
  return getPostLoginRedirect(searchParams, { consume: true });
}
