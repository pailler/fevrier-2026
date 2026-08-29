/** Préfixe public : app Resas sous iahome.fr/resas-system/embed → :5000. */
export const RESAS_SYSTEM_EMBED_PREFIX = '/resas-system/embed';

export const RESAS_SYSTEM_INTERNAL_URL =
  process.env.RESAS_SYSTEM_INTERNAL_URL || 'http://host.docker.internal:5000';

export function buildResasSystemUpstreamUrl(
  pathSegments: string[],
  search: string
): string {
  const path = pathSegments.filter(Boolean).join('/');
  const base = RESAS_SYSTEM_INTERNAL_URL.replace(/\/$/, '');
  const upstream = path ? `${base}/${path}` : `${base}/`;
  if (!search) return upstream;
  return `${upstream}${search.startsWith('?') ? search : `?${search}`}`;
}

/**
 * HTML / JS Resas : <base> pour assets relatifs + patch /api
 * (sur iahome.fr, app-backend.js appelle `${origin}/api` → hors proxy).
 */
export function rewriteResasSystemHtml(html: string): string {
  const root = RESAS_SYSTEM_EMBED_PREFIX;
  const apiPatch = `<script>(function(){
var r=${JSON.stringify(root)};
var o=location.origin;
function fix(u){
  if(typeof u!=="string"||!u)return u;
  if(u.indexOf("data:")===0||u.indexOf("blob:")===0)return u;
  if(u===r||u.indexOf(r+"/")===0||u.indexOf(o+r)===0)return u;
  if(u==="/api"||u.indexOf("/api/")===0||u.indexOf("/api?")===0)return r+u;
  if(u===o+"/api"||u.indexOf(o+"/api/")===0||u.indexOf(o+"/api?")===0)return o+r+u.slice(o.length);
  if(u.charAt(0)==="/"&&u.indexOf("//")!==0&&u.indexOf(r)!==0){
    if(u.indexOf("/api")===0)return r+u;
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
})();</script>`;

  let out = html;
  out = out.replace(/<base\s+[^>]*>/gi, '');
  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1><base href="${root}/">${apiPatch}`);
  } else {
    out = `<base href="${root}/">` + apiPatch + out;
  }
  return out;
}

/** Réécrit getApiBaseUrl dans app-backend.js pour forcer le préfixe embed. */
export function rewriteResasSystemJs(js: string): string {
  const root = RESAS_SYSTEM_EMBED_PREFIX;
  let out = js;
  // Cas iahome.fr / regispailler.fr → /api absolu
  out = out.replace(
    /return\s+`\$\{protocol\}\/\/\$\{hostname\}\/api`/g,
    `return \`\${protocol}//\${hostname}${root}/api\``
  );
  out = out.replace(
    /return\s+['"]https?:\/\/[^'"]+\/api['"]/g,
    (m) => m
  );
  // Fallback relatif avec port
  out = out.replace(
    /return\s+`\$\{protocol\}\/\/\$\{hostname\}\$\{window\.location\.port \? ':' \+ window\.location\.port : ''\}\/api`/g,
    `return \`\${protocol}//\${hostname}\${window.location.port ? ':' + window.location.port : ''}${root}/api\``
  );
  return out;
}
