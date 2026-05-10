/**
 * Après POST /api/generate-access-token : construit l’URL à ouvrir dans le navigateur.
 * En local sur IAHome, l’API renvoie `url` (proxy `/api/secure-proxy?...`) : on la préfère
 * pour que le jeton soit bien présent et routé vers le bon port.
 * En prod, on ouvre le sous-domaine du module avec `?token=...` (comme PsiTransfer).
 */
export function getModuleAccessOpenUrl(params: {
  token: string;
  apiUrl?: string | null;
  targetBaseUrl: string;
}): string {
  const { token, apiUrl, targetBaseUrl } = params;
  const proxy = (apiUrl || '').trim();
  const isBrowserLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isBrowserLocal && proxy.includes('/api/secure-proxy')) {
    return proxy;
  }
  const base = (targetBaseUrl || '').trim();
  if (!base) return '';
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}token=${encodeURIComponent(token)}`;
}
