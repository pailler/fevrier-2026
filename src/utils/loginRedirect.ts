/**
 * Construction d’URL /login?redirect=… et validation du retour post-connexion (chemins relatifs uniquement).
 */

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
