/** Préfixe public : app sous iahome.fr/apprendre-autrement/embed → :9001. */
export const APPRENDRE_AUTREMENT_EMBED_PREFIX = '/apprendre-autrement/embed';

export const APPRENDRE_AUTREMENT_INTERNAL_URL =
  process.env.APPRENDRE_AUTREMENT_INTERNAL_URL ||
  (process.env.APPRENDRE_AUTREMENT_HTTP_HOST
    ? `http://${process.env.APPRENDRE_AUTREMENT_HTTP_HOST}:9001`
    : 'http://host.docker.internal:9001');

export function buildApprendreAutrementUpstreamUrl(
  pathSegments: string[],
  search: string
): string {
  const path = pathSegments.filter(Boolean).join('/');
  const base = APPRENDRE_AUTREMENT_INTERNAL_URL.replace(/\/$/, '');
  // Page vide → route principale de l’app standalone
  const upstreamPath = path || 'apprendre-autrement';
  const upstream = `${base}/${upstreamPath}`;
  if (!search) return upstream;
  return `${upstream}${search.startsWith('?') ? search : `?${search}`}`;
}

/**
 * HTML Next.js : assets /_next et routes /apprendre-autrement sous le préfixe embed.
 * Ne jamais réécrire un chemin déjà préfixé (sinon double /embed/embed/…).
 */
export function rewriteApprendreAutrementHtml(html: string): string {
  const root = APPRENDRE_AUTREMENT_EMBED_PREFIX;
  const patch = `<script>(function(){
var r=${JSON.stringify(root)};
var o=location.origin;
function already(u){return typeof u==="string"&&(u===r||u.indexOf(r+"/")===0||u.indexOf(o+r)===0);}
function fix(u){
  if(typeof u!=="string"||!u)return u;
  if(u.indexOf("data:")===0||u.indexOf("blob:")===0)return u;
  if(already(u))return u;
  if(u.indexOf("/_next/")===0)return r+u;
  if(u==="/apprendre-autrement"||u.indexOf("/apprendre-autrement/")===0||u.indexOf("/apprendre-autrement?")===0){
    if(u.indexOf("/apprendre-autrement/embed")===0)return u;
    return r+u;
  }
  if(u.indexOf(o+"/_next/")===0)return o+r+u.slice(o.length);
  if(u===o+"/apprendre-autrement"||u.indexOf(o+"/apprendre-autrement/")===0||u.indexOf(o+"/apprendre-autrement?")===0){
    if(u.indexOf(o+"/apprendre-autrement/embed")===0)return u;
    return o+r+u.slice(o.length);
  }
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
  // Absolute /_next → embed/_next (skip if already under embed)
  out = out.replace(
    /(\s(?:src|href)=["'])\/(?!apprendre-autrement\/embed\/)_next\//gi,
    `$1${root}/_next/`
  );
  out = out.replace(
    /(\s(?:src|href)=["'])\/apprendre-autrement(?!\/embed)(?=\/|"|\?|#)/gi,
    `$1${root}/apprendre-autrement`
  );
  out = out.replace(/"\/(?!apprendre-autrement\/embed\/)_next\//g, `"${root}/_next/`);
  out = out.replace(/"\/apprendre-autrement(?!\/embed)/g, `"${root}/apprendre-autrement`);

  out = out.replace(/<base\s+[^>]*>/gi, '');
  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1>${patch}`);
  } else {
    out = patch + out;
  }
  return out;
}
