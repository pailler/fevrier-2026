/** Préfixe interne (iframe) : proxy Next.js → service MeTube (:8081). */
export const METUBE_EMBED_PREFIX = '/metube/embed';

export const METUBE_INTERNAL_URL =
  process.env.METUBE_INTERNAL_URL ||
  process.env.METUBE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'http://metube-iahome:8081'
    : 'http://127.0.0.1:8081');

export function buildMetubeUpstreamUrl(
  pathSegments: string[],
  search: string
): string {
  const path = pathSegments.filter(Boolean).join('/');
  const base = METUBE_INTERNAL_URL.replace(/\/$/, '');
  const upstream = path ? `${base}/${path}` : `${base}/`;
  if (!search) return upstream;
  return `${upstream}${search.startsWith('?') ? search : `?${search}`}`;
}

/** Réécrit le HTML pour que /api/* et les assets relatifs passent par le proxy embed. */
export function rewriteMetubeHtml(html: string): string {
  const root = METUBE_EMBED_PREFIX;
  const fetchPatch = `<script>(function(){var r="${root}";var f=fetch;window.fetch=function(i,n){if(typeof i==="string"&&i.indexOf("/api/")===0)i=r+i;return f.call(this,i,n);};var o=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(typeof u==="string"&&u.indexOf("/api/")===0)u=r+u;return o.apply(this,arguments);};})();</script>`;
  // MeTube calcule le path Socket.IO via pathname + "socket.io" (ex. /metube/embed → /metube/embedsocket.io)
  const socketPatch = `<script>(function(){try{var p=location.pathname.replace(/share-target/,"");if(p.indexOf("${root}")===0&&p.indexOf("socket.io")<0){var d=Object.getOwnPropertyDescriptor(Location.prototype,"pathname");if(d&&d.get){Object.defineProperty(location,"pathname",{configurable:true,get:function(){return "/";}});}}}catch(e){}})();</script>`;

  let out = html;
  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1><base href="${root}/">${socketPatch}${fetchPatch}`);
  } else {
    out = socketPatch + fetchPatch + out;
  }

  out = out.replace(/(\s(?:src|href)=["'])\/api\//gi, `$1${root}/api/`);
  return out;
}
