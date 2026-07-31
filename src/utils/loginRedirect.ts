/**
 * Construction d’URL /login?redirect=… et validation du retour post-connexion (chemins relatifs uniquement).
 */

export const AUTH_REDIRECT_STORAGE_KEY = 'auth_redirect';

const RETURN_BLOCKLIST_PREFIXES = [
  '/login',
  '/signup',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
] as const;

function isBlocklistedPath(pathname: string): boolean {
  return RETURN_BLOCKLIST_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/**
 * Chemin + query à réutiliser après connexion (ex. /modules, /card/x?openApp=1).
 */
export function pathForAuthReturn(
  pathname: string | null | undefined,
  searchParamsString: string
): string {
  const p = pathname && pathname.length > 0 ? pathname : '/';
  const q =
    searchParamsString && searchParamsString.length > 0
      ? `?${searchParamsString.replace(/^\?/, '')}`
      : '';
  if (isBlocklistedPath(p)) {
    return '/';
  }
  return `${p}${q}`;
}

/**
 * Lien vers la page de connexion en conservant la page courante (path + query).
 */
export function loginUrlWithReturn(
  pathname: string | null | undefined,
  searchParams: { toString(): string } | null | undefined
): string {
  const sp = searchParams?.toString() ?? '';
  const target = pathForAuthReturn(pathname, sp);
  if (target === '/') {
    return '/login';
  }
  return `/login?redirect=${encodeURIComponent(target)}`;
}

/**
 * Valeur sûre pour router.push / window.location après login (pas d’open redirect).
 */
export function sanitizeReturnPath(raw: string | null | undefined): string {
  if (raw == null || typeof raw !== 'string') {
    return '/';
  }
  let s = raw.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    return '/';
  }
  s = s.trim();
  if (!s.startsWith('/') || s.startsWith('//')) {
    return '/';
  }
  if (s.includes('\\') || s.includes('\0')) {
    return '/';
  }
  const noQuery = s.split('?')[0] ?? s;
  if (isBlocklistedPath(noQuery)) {
    return '/';
  }
  return s;
}

/** Mémorise la page de retour (OAuth / email) dans sessionStorage. */
export function persistPostLoginRedirect(path: string): void {
  if (typeof sessionStorage === 'undefined') return;
  const safe = sanitizeReturnPath(path);
  if (safe === '/') return;
  sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, safe);
}

/**
 * Page de retour après connexion : param URL `redirect`, puis sessionStorage.
 * @param consume — retire la valeur du sessionStorage (callback OAuth).
 */
export function getPostLoginRedirect(
  searchParams: URLSearchParams | null | undefined,
  options?: { consume?: boolean }
): string {
  let raw: string | null = null;

  if (searchParams) {
    raw = searchParams.get('redirect');
  }

  if (!raw && typeof sessionStorage !== 'undefined') {
    raw = sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY);
    if (raw && options?.consume) {
      sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
    }
  }

  return sanitizeReturnPath(raw);
}

/** URL /login avec la page courante (navigateur). */
export function loginHrefFromWindow(): string {
  if (typeof window === 'undefined') return '/login';
  const q = window.location.search.replace(/^\?/, '');
  return loginUrlWithReturn(window.location.pathname, { toString: () => q });
}

/** Ajoute ?redirect= au callback OAuth Supabase pour survivre au round-trip Google. */
export function oauthCallbackUrlWithReturn(
  callbackBaseUrl: string,
  returnPath: string
): string {
  const safe = sanitizeReturnPath(returnPath);
  if (safe === '/') return callbackBaseUrl;
  try {
    const url = new URL(callbackBaseUrl);
    url.searchParams.set('redirect', safe);
    return url.toString();
  } catch {
    const sep = callbackBaseUrl.includes('?') ? '&' : '?';
    return `${callbackBaseUrl}${sep}redirect=${encodeURIComponent(safe)}`;
  }
}
