/** Préfixe public : app sous iahome.fr/reveil/embed → :7891. */
export const REVEIL_EMBED_PREFIX = '/reveil/embed';

export const REVEIL_INTERNAL_URL =
  process.env.REVEIL_INTERNAL_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'http://iahome-reveil:7891'
    : 'http://127.0.0.1:7891');

export function buildReveilUpstreamUrl(pathSegments: string[], search: string): string {
  const path = pathSegments.filter(Boolean).join('/');
  const base = REVEIL_INTERNAL_URL.replace(/\/$/, '');
  const upstream = path ? `${base}/${path}` : `${base}/`;
  if (!search) return upstream;
  return `${upstream}${search.startsWith('?') ? search : `?${search}`}`;
}

/**
 * HTML Next.js Réveil : /_next et /api sous le préfixe embed.
 * Ne jamais réécrire un chemin déjà préfixé.
 */
export function rewriteReveilHtml(html: string): string {
  const root = REVEIL_EMBED_PREFIX;
  const patch = `<script>(function(){
var r=${JSON.stringify(root)};
var o=location.origin;
function already(u){return typeof u==="string"&&(u===r||u.indexOf(r+"/")===0||u.indexOf(o+r)===0);}
function fix(u){
  if(typeof u!=="string"||!u)return u;
  if(u.indexOf("data:")===0||u.indexOf("blob:")===0)return u;
  if(already(u))return u;
  if(u.indexOf("/_next/")===0||u.indexOf("/api/")===0)return r+u;
  if(u.indexOf(o+"/_next/")===0||u.indexOf(o+"/api/")===0)return o+r+u.slice(o.length);
  return u;
}
var f=window.fetch;
window.fetch=function(i,n){
  if(typeof i==="string")i=fix(i);
  else if(i&&typeof i.url==="string"){try{i=new Request(fix(i.url),i);}catch(e){}}
  return f.call(this,i,n);
};
var XO=XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open=function(m,u){if(typeof u==="string")arguments[1]=fix(u);return XO.apply(this,arguments);};
try{
  var push=history.pushState.bind(history);
  var replace=history.replaceState.bind(history);
  history.pushState=function(s,t,u){if(typeof u==="string")u=fix(u);return push(s,t,u);};
  history.replaceState=function(s,t,u){if(typeof u==="string")u=fix(u);return replace(s,t,u);};
}catch(e){}
})();</script>`;

  let out = html;
  out = out.replace(/(\s(?:src|href)=["'])\/(?!reveil\/embed\/)_next\//gi, `$1${root}/_next/`);
  out = out.replace(/(\s(?:src|href)=["'])\/(?!reveil\/embed\/)api\//gi, `$1${root}/api/`);
  out = out.replace(/"\/(?!reveil\/embed\/)_next\//g, `"${root}/_next/`);
  out = out.replace(/"\/(?!reveil\/embed\/)api\//g, `"${root}/api/`);

  out = out.replace(/<base\s+[^>]*>/gi, '');
  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1>${patch}`);
  } else {
    out = patch + out;
  }
  return out;
}

export function rewriteReveilPayload(body: string): string {
  const root = REVEIL_EMBED_PREFIX;
  let out = body;
  // Absolute /_next and /api → embed (skip already prefixed)
  out = out.replace(/([^/]|^)\/_next\//g, `$1${root}/_next/`);
  out = out.replace(/([^/]|^)\/api\//g, `$1${root}/api/`);
  out = out.split(`${root}${root}/`).join(`${root}/`);
  return out;
}
