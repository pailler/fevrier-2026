/**
 * Application « image → 3D » sur IA Home (Hi3DGen).
 * L’ancien sous-domaine hunyuan3d.iahome.fr n’est plus utilisé pour l’accès utilisateur.
 */
function isHi3dgenStandaloneHost(host: string): boolean {
  return host === 'localhost:8095' || host === '127.0.0.1:8095';
}

export function getHunyuan3dAppUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const host = window.location.host;
    if (isHi3dgenStandaloneHost(host)) {
      return `${window.location.origin}/`;
    }
    return `${window.location.origin}/card/hi3dgen`;
  }
  const env = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SITE_URL : undefined;
  if (env && /^https?:\/\//i.test(String(env))) {
    const base = String(env).replace(/\/$/, '');
    try {
      const u = new URL(base);
      if (u.port === '8095' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
        return `${u.origin}/`;
      }
    } catch {
      /* ignore */
    }
    return `${base}/card/hi3dgen`;
  }
  return 'https://iahome.fr/card/hi3dgen';
}
