/** Préfixe interne (iframe) : proxy Next.js → service PsiTransfer (:8087). */
export const PSITRANSFER_EMBED_PREFIX = '/psitransfer/embed';

export const PSITRANSFER_INTERNAL_URL =
  process.env.PSITRANSFER_INTERNAL_URL ||
  process.env.PSITRANSFER_SERVICE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'http://psitransfer-iahome:3000'
    : 'http://127.0.0.1:8087');

export function buildPsitransferUpstreamUrl(
  pathSegments: string[],
  search: string
): string {
  const path = pathSegments.filter(Boolean).join('/');
  const base = PSITRANSFER_INTERNAL_URL.replace(/\/$/, '');
  const upstream = path ? `${base}/${path}` : `${base}/`;
  if (!search) return upstream;
  return `${upstream}${search.startsWith('?') ? search : `?${search}`}`;
}

/** Réécrit le HTML servi sur psitransfer.iahome.fr (app directe + liens de partage). */
export function rewritePsitransferHtmlForPublicHost(html: string): string {
  let modified = html;
  modified = modified.replace(/https?:\/\/psitransfer\.regispailler\.fr\//g, '/');
  modified = modified.replace(/https?:\/\/localhost:808[47]\//g, '/');
  modified = modified.replace(/https?:\/\/127\.0\.0\.1:808[47]\//g, '/');
  modified = modified.replace(/https?:\/\/psitransfer\.iahome\.fr\//g, '/');

  if (/<head[^>]*>/i.test(modified) && !/<base href="/i.test(modified)) {
    modified = modified.replace(/<head([^>]*)>/i, `<head$1><base href="/">`);
  }

  modified = modified.replace(/href="assets\//g, 'href="/assets/');
  modified = modified.replace(/src="app\//g, 'src="/app/');
  modified = modified.replace(/src="assets\//g, 'src="/assets/');
  modified = modified.replace(/href="\/assets\//g, 'href="/assets/');
  modified = modified.replace(/src="\/app\//g, 'src="/app/');
  modified = modified.replace(/src="\/assets\//g, 'src="/assets/');
  modified = modified.replace(/url\(assets\//g, 'url(/assets/');
  modified = modified.replace(/url\(app\//g, 'url(/app/');
  modified = modified.replace(/url\(\/assets\//g, 'url(/assets/');
  modified = modified.replace(/url\(\/app\//g, 'url(/app/');
  modified = modified.replace(
    /script\.src = 'assets\//g,
    "script.src = '/assets/"
  );

  return modified;
}

/** Réécrit le HTML pour que assets et chemins passent par le proxy embed. */
export function rewritePsitransferHtml(html: string): string {
  const root = PSITRANSFER_EMBED_PREFIX;

  let modified = html;
  modified = modified.replace(/https?:\/\/psitransfer\.regispailler\.fr\//g, `${root}/`);
  modified = modified.replace(/https?:\/\/localhost:808[47]\//g, `${root}/`);
  modified = modified.replace(/https?:\/\/127\.0\.0\.1:808[47]\//g, `${root}/`);
  modified = modified.replace(/https?:\/\/psitransfer\.iahome\.fr\//g, `${root}/`);

  if (/<head[^>]*>/i.test(modified)) {
    modified = modified.replace(/<head([^>]*)>/i, `<head$1><base href="${root}/">`);
  } else {
    modified = `<base href="${root}/">` + modified;
  }

  modified = modified.replace(/<base href="\/">/g, `<base href="${root}/">`);

  modified = modified.replace(/href="assets\//g, `href="${root}/assets/`);
  modified = modified.replace(/src="app\//g, `src="${root}/app/`);
  modified = modified.replace(/src="assets\//g, `src="${root}/assets/`);

  modified = modified.replace(/href="\/assets\//g, `href="${root}/assets/`);
  modified = modified.replace(/src="\/app\//g, `src="${root}/app/`);
  modified = modified.replace(/src="\/assets\//g, `src="${root}/assets/`);

  modified = modified.replace(/url\(assets\//g, `url(${root}/assets/`);
  modified = modified.replace(/url\(app\//g, `url(${root}/app/`);
  modified = modified.replace(/url\(\/assets\//g, `url(${root}/assets/`);
  modified = modified.replace(/url\(\/app\//g, `url(${root}/app/`);

  modified = modified.replace(/(\s(?:src|href)=["'])\/api\//gi, `$1${root}/api/`);

  return modified;
}
