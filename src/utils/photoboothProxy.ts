/** Préfixe interne (iframe) : proxy Next.js → service Photobooth (:7885). */
export const PHOTOBOOTH_EMBED_PREFIX = '/photobooth/embed';

export const PHOTOBOOTH_INTERNAL_URL =
  process.env.PHOTOBOOTH_INTERNAL_URL || 'http://127.0.0.1:7885';

export function buildPhotoboothUpstreamUrl(
  pathSegments: string[],
  search: string
): string {
  const path = pathSegments.filter(Boolean).join('/');
  const base = PHOTOBOOTH_INTERNAL_URL.replace(/\/$/, '');
  const upstream = path ? `${base}/${path}` : `${base}/`;
  if (!search) return upstream;
  return `${upstream}${search.startsWith('?') ? search : `?${search}`}`;
}

/** Réécrit le HTML pour que /api/* et les assets relatifs passent par le proxy embed. */
export function rewritePhotoboothHtml(html: string): string {
  const root = PHOTOBOOTH_EMBED_PREFIX;
  const fetchPatch = `<script>(function(){var r="${root}";var f=fetch;window.fetch=function(i,n){if(typeof i==="string"&&i.indexOf("/api/")===0)i=r+i;return f.call(this,i,n);};})();</script>`;

  let out = html;
  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1><base href="${root}/">${fetchPatch}`);
  } else {
    out = fetchPatch + out;
  }

  out = out.replace(/(\s(?:src|href)=["'])\/api\//gi, `$1${root}/api/`);
  return out;
}
