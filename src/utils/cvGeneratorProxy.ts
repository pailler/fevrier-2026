/** Proxy Next.js iahome → service cv-generator (:3003). */
export const CV_GENERATOR_INTERNAL_URL =
  process.env.CV_GENERATOR_INTERNAL_URL ||
  process.env.CV_GENERATOR_SERVICE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'http://host.docker.internal:3003'
    : 'http://127.0.0.1:3003');

export function buildCvGeneratorUpstreamUrl(
  pathSegments: string[],
  search: string
): string {
  const path = pathSegments.filter(Boolean).join('/');
  const base = CV_GENERATOR_INTERNAL_URL.replace(/\/$/, '');
  const upstream = path ? `${base}/${path}` : `${base}/`;
  if (!search) return upstream;
  return `${upstream}${search.startsWith('?') ? search : `?${search}`}`;
}

/** Réécrit le HTML servi sur cv.iahome.fr (proxy racine). */
export function rewriteCvGeneratorHtmlForPublicHost(html: string): string {
  let modified = html;
  modified = modified.replace(/https?:\/\/localhost:3003\//g, '/');
  modified = modified.replace(/https?:\/\/127\.0\.0\.1:3003\//g, '/');
  modified = modified.replace(/https?:\/\/cv\.iahome\.fr\//g, '/');

  if (/<head[^>]*>/i.test(modified) && !/<base href="/i.test(modified)) {
    modified = modified.replace(/<head([^>]*)>/i, `<head$1><base href="/">`);
  }

  return modified;
}
