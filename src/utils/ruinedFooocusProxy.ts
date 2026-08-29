/** Préfixe public : Gradio servi sous iahome.fr/ruinedfooocus/embed → :7870. */
export const RUINEDFOOOCUS_EMBED_PREFIX = '/ruinedfooocus/embed';

export const RUINEDFOOOCUS_INTERNAL_URL =
  process.env.RUINEDFOOOCUS_INTERNAL_URL || 'http://host.docker.internal:7870';

export function buildRuinedFooocusUpstreamUrl(
  pathSegments: string[],
  search: string
): string {
  const path = pathSegments.filter(Boolean).join('/');
  const base = RUINEDFOOOCUS_INTERNAL_URL.replace(/\/$/, '');
  const upstream = path ? `${base}/${path}` : `${base}/`;
  if (!search) return upstream;
  return `${upstream}${search.startsWith('?') ? search : `?${search}`}`;
}

const PUBLIC_ORIGIN = 'https://iahome.fr';

function internalOriginPatterns(): string[] {
  const origins = new Set<string>([
    'http://host.docker.internal:7870',
    'https://host.docker.internal:7870',
    'http://127.0.0.1:7870',
    'http://localhost:7870',
    'http://192.168.1.39:7870',
  ]);
  try {
    origins.add(new URL(RUINEDFOOOCUS_INTERNAL_URL).origin);
  } catch {
    /* ignore */
  }
  return [...origins];
}

/** Réécrit les URLs amont (HTML ou JSON) vers le préfixe embed public. */
export function rewriteRuinedFooocusPayload(body: string): string {
  const root = RUINEDFOOOCUS_EMBED_PREFIX;
  // Slash final OBLIGATOIRE : sinon new URL('gradio_api/…', root) → /ruinedfooocus/gradio_api (404 Not Found)
  const publicBase = `${PUBLIC_ORIGIN}${root}/`;
  let out = body;
  for (const origin of internalOriginPatterns()) {
    const escaped = origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escaped, 'gi'), publicBase.replace(/\/$/, ''));
  }
  // Config Gradio (/config) : sans ça api_prefix reste /gradio_api → hors proxy / mélange IAHome
  out = out.replace(/"api_prefix"\s*:\s*"\/gradio_api"/g, `"api_prefix":"${root}/gradio_api"`);
  out = out.replace(
    /"api_prefix"\s*:\s*"\/ruinedfooocus\/embed\/gradio_api"/g,
    `"api_prefix":"${root}/gradio_api"`
  );
  // Forcer root avec slash final (écrase toute variante)
  out = out.replace(
    /"root"\s*:\s*"https:\/\/(?:www\.)?iahome\.fr\/ruinedfooocus\/embed\/?"/g,
    `"root":"${publicBase}"`
  );
  out = out.replace(
    /"root"\s*:\s*"https:\/\/(?:www\.)?iahome\.fr\/?"/g,
    `"root":"${publicBase}"`
  );
  out = out.replace(
    /"root"\s*:\s*"https?:\/\/(?:127\.0\.0\.1|localhost|host\.docker\.internal|192\.168\.1\.39)(?::\d+)?"/gi,
    `"root":"${publicBase}"`
  );
  return out;
}

/**
 * HTML Gradio : config + patch runtime.
 * <base href> sert uniquement aux assets relatifs (./assets/*). Les chemins absolus "/"
 * ignorent <base> — ils sont réécrits ci-dessous + patch fetch (évite la homepage IAHome).
 */
export function rewriteRuinedFooocusHtml(html: string): string {
  const root = RUINEDFOOOCUS_EMBED_PREFIX;
  const publicOrigin = PUBLIC_ORIGIN;
  const internalList = JSON.stringify(internalOriginPatterns());

  const fetchPatch = `<script>(function(){
var r=${JSON.stringify(root)};
var o=location.origin;
var internals=${internalList};
function already(u){return typeof u==="string"&&(u===r||u.indexOf(r+"/")===0||u.indexOf(o+r)===0);}
function fix(u){
  if(typeof u!=="string"||!u)return u;
  if(u.indexOf("data:")===0||u.indexOf("blob:")===0)return u;
  if(already(u))return u;
  for(var i=0;i<internals.length;i++){
    var b=internals[i];
    if(u===b||u===b+"/")return o+r+"/";
    if(u.indexOf(b)===0)return o+r+u.slice(b.length);
  }
  if(u===o||u===o+"/")return o+r+"/";
  if(u.indexOf(o+"/gradio_api")===0)return u.replace(o,o+r);
  if(u.indexOf(o+"/")===0&&u.indexOf(o+r)!==0){
    var rest=u.slice(o.length);
    if(rest==="/"||rest.indexOf("/gradio_api")===0||rest.indexOf("/file=")===0||rest.indexOf("/assets")===0||rest.indexOf("/theme")===0||rest.indexOf("/manifest")===0||rest.indexOf("/queue")===0||rest.indexOf("/login")===0||rest.indexOf("/info")===0||rest.indexOf("/config")===0)
      return o+r+(rest==="/"?"":rest);
  }
  if(u==="/"||u==="/gradio_api"||u.indexOf("/gradio_api")===0||u.indexOf("/file=")===0)return r+(u==="/"?"/":u);
  if(u.charAt(0)==="/"&&u.indexOf("//")!==0){if(already(u))return u;return r+u;}
  if(u.indexOf("ws://")===0||u.indexOf("wss://")===0){
    try{var x=new URL(u);if(x.host===location.host&&x.pathname.indexOf(r)!==0){x.pathname=r+(x.pathname==="/"?"":x.pathname);return x.toString();}}catch(e){}
  }
  return u;
}
function rewriteJson(t){
  if(typeof t!=="string")return t;
  if(t.indexOf("gradio_api")===-1&&t.indexOf("host.docker")===-1&&t.indexOf(":7870")===-1&&t.indexOf(o+"/")===-1&&t.indexOf('"root"')===-1)return t;
  var out=t;
  for(var i=0;i<internals.length;i++)out=out.split(internals[i]).join(o+r);
  out=out.split('"api_prefix":"/gradio_api"').join('"api_prefix":"'+r+'/gradio_api"');
  out=out.split('"api_prefix": "/gradio_api"').join('"api_prefix":"'+r+'/gradio_api"');
  out=out.split('"root":"'+o+'"').join('"root":"'+o+r+'/"');
  out=out.split('"root": "'+o+'"').join('"root":"'+o+r+'/"');
  out=out.split('"root":"'+o+'/"').join('"root":"'+o+r+'/"');
  out=out.split('"root":"'+o+r+'"').join('"root":"'+o+r+'/"');
  out=out.split('"root": "'+o+r+'"').join('"root":"'+o+r+'/"');
  return out;
}
var f=window.fetch;
window.fetch=function(i,n){
  if(typeof i==="string")i=fix(i);
  else if(i&&typeof i.url==="string"){try{i=new Request(fix(i.url),i);}catch(e){}}
  return f.call(this,i,n).then(function(res){
    var ct=res.headers.get("content-type")||"";
    // Gradio sse_v3 : ne jamais bufferiser le flux (sinon Generate → Error Not Found)
    if(ct.indexOf("text/event-stream")!==-1||ct.indexOf("octet-stream")!==-1)return res;
    if(ct.indexOf("json")===-1&&ct.indexOf("text/")===-1&&ct.indexOf("javascript")===-1)return res;
    return res.text().then(function(t){
      return new Response(rewriteJson(t),{status:res.status,statusText:res.statusText,headers:res.headers});
    });
  });
};
var XO=XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open=function(m,u){if(typeof u==="string")arguments[1]=fix(u);return XO.apply(this,arguments);};
if(window.EventSource){
  var ES=window.EventSource;
  window.EventSource=function(u,c){return new ES(fix(String(u)),c);};
  window.EventSource.prototype=ES.prototype;
}
if(window.WebSocket){
  var WS=window.WebSocket;
  window.WebSocket=function(u,p){u=fix(String(u));return p===undefined?new WS(u):new WS(u,p);};
  window.WebSocket.prototype=WS.prototype;
  ["CONNECTING","OPEN","CLOSING","CLOSED"].forEach(function(k){Object.defineProperty(window.WebSocket,k,{value:WS[k]});});
}
// Empêche Gradio d'embarquer la homepage via iframe.src = "/"
try{
  var desc=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,"src")||Object.getOwnPropertyDescriptor(HTMLElement.prototype,"src");
  if(desc&&desc.set){
    Object.defineProperty(HTMLIFrameElement.prototype,"src",{
      configurable:true,
      enumerable:true,
      get:desc.get,
      set:function(v){desc.set.call(this,fix(String(v)));}
    });
  }
}catch(e){}
var SA=Element.prototype.setAttribute;
Element.prototype.setAttribute=function(n,v){
  if((n==="src"||n==="href")&&typeof v==="string")v=fix(v);
  return SA.call(this,n,v);
};
document.addEventListener("click",function(ev){
  var a=ev.target&&ev.target.closest?ev.target.closest("a[href]"):null;
  if(!a)return;
  var href=a.getAttribute("href");
  if(!href)return;
  var fixed=fix(href);
  if(fixed!==href)a.setAttribute("href",fixed);
},true);
})();</script>`;

  let out = rewriteRuinedFooocusPayload(html);

  out = out.replace(/"api_prefix"\s*:\s*"\/gradio_api"/g, `"api_prefix":"${root}/gradio_api"`);
  out = out.replace(/"root"\s*:\s*"https?:\/\/[^"]+"/g, `"root":"${publicOrigin}${root}/"`);
  out = out.replace(
    /https?:\/\/(?:iahome\.fr|www\.iahome\.fr)\/gradio_api/gi,
    `${publicOrigin}${root}/gradio_api`
  );
  out = out.replace(
    /https?:\/\/(?:iahome\.fr|www\.iahome\.fr)(?=\/(?:file=|assets\/|theme|manifest|queue|gradio_api)|\s|"|'|<)/gi,
    `${publicOrigin}${root}`
  );

  // Ne jamais laisser root = apex / embed sans slash
  out = out.replace(
    /"root"\s*:\s*"https:\/\/iahome\.fr"/g,
    `"root":"${publicOrigin}${root}/"`
  );
  out = out.replace(
    /"root"\s*:\s*"https:\/\/iahome\.fr\/ruinedfooocus\/embed"/g,
    `"root":"${publicOrigin}${root}/"`
  );

  out = out.replace(
    /(\s(?:src|href|action)=["'])\/(?!\/)(?!ruinedfooocus\/embed(?:\/|"|\?|#))/gi,
    `$1${root}/`
  );

  // Gradio 6 Vite : src="./assets/…" — sans slash final sur /embed, ça devient /ruinedfooocus/assets (hors proxy)
  out = out.replace(
    /(\s(?:src|href)=["'])\.\/assets\//gi,
    `$1${root}/assets/`
  );
  out = out.replace(
    /(\s(?:src|href)=["'])(?!\.?\.?\/|https?:|data:|blob:)assets\//gi,
    `$1${root}/assets/`
  );

  // Un seul <base> sous le préfixe embed (comme MeTube / Photobooth)
  out = out.replace(/<base\s+[^>]*>/gi, '');
  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(
      /<head([^>]*)>/i,
      `<head$1><base href="${root}/">${fetchPatch}`
    );
  } else {
    out = `<base href="${root}/">` + fetchPatch + out;
  }

  return out;
}
