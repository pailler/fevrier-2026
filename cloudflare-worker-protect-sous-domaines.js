/**
 * Cloudflare Worker — protect-sous-domaines-iahome
 * Format modules (export default) — secrets via wrangler : JWT_SECRET
 *
 * Route Cloudflare : *.iahome.fr/*
 *
 * - Landings SEO (HOSTS_SKIP_DOCUMENT_TOKEN) : publiques
 * - Infra (HOSTS_SKIP_ALWAYS) : publiques
 * - Autres sous-domaines : navigation HTML exige JWT IAHome valide (?token=)
 *   provenant d’iahome.fr (Sec-Fetch-Site same-site) OU cookie de session gate
 *   → un lien ?token= collé dans un autre navigateur est refusé
 * - Assets / API / WS / SSE : laissés passer
 */

/** Landings produit / démos publiques — pas de gate token. */
const HOSTS_SKIP_DOCUMENT_TOKEN = new Set([
  'photobooth.iahome.fr',
  'www.photobooth.iahome.fr',
  'resas.iahome.fr',
  'www.resas.iahome.fr',
  'game.iahome.fr',
  'code-learning.iahome.fr',
  'www.code-learning.iahome.fr',
  'psitransfer.iahome.fr',
  'www.psitransfer.iahome.fr',
  'metube.iahome.fr',
  'www.metube.iahome.fr',
  'cv.iahome.fr',
  'www.cv.iahome.fr',
  'ruinedfooocus.iahome.fr',
  'www.ruinedfooocus.iahome.fr',
  'apprendre-autrement.iahome.fr',
  'www.apprendre-autrement.iahome.fr',
  'reveil.iahome.fr',
  'www.reveil.iahome.fr',
  // Ancien host : Next redirige vers reveil.iahome.fr (pas de gate)
  'reveil-intelligent.iahome.fr',
  'www.reveil-intelligent.iahome.fr',
  'stablediffusion.iahome.fr',
  'www.stablediffusion.iahome.fr',
  'detecteur-ia.iahome.fr',
  'www.detecteur-ia.iahome.fr',
]);

/** Infra / hors apps utilisateur — laisser passer. */
const HOSTS_SKIP_ALWAYS = new Set([
  'portainer.iahome.fr',
  'www.portainer.iahome.fr',
  'minecraft.iahome.fr',
  'www.minecraft.iahome.fr',
]);

const MUSE_TALK_HOSTS = new Set(['musetalk.iahome.fr', 'www.musetalk.iahome.fr']);

const GATE_COOKIE = 'iahome_gate';
const GATE_MAX_AGE_SEC = 60 * 60 * 24; // 24h
const DENY_URL = 'https://iahome.fr/encours?error=direct_access_denied';

/** Fallback aligné sur Next si le secret Worker n’est pas encore configuré. */
const JWT_SECRET_FALLBACK = 'votre-jwt-secret-tres-securise-changez-cela-immediatement';

const RESOURCE_EXTENSIONS = [
  '.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.json',
  '.xml', '.pdf', '.zip', '.txt', '.map', '.webp', '.avif',
  '.otf', '.wasm', '.mp3', '.wav', '.ogg', '.webmanifest',
];

function clientHostname(request) {
  try {
    const fromUrl = new URL(request.url).hostname.toLowerCase().replace(/\.$/, '');
    if (fromUrl) return fromUrl;
  } catch {
    // ignore
  }
  const raw =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    '';
  let h = raw.split(',')[0].trim().split(':')[0].toLowerCase();
  if (h.endsWith('.')) h = h.slice(0, -1);
  return h;
}

function base64UrlToBytes(b64url) {
  const pad = '='.repeat((4 - (b64url.length % 4)) % 4);
  const b64 = (b64url + pad).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function verifyHs256Jwt(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;

  let header;
  try {
    header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(headerB64)));
  } catch {
    return null;
  }
  if (header.alg !== 'HS256') return null;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const sig = base64UrlToBytes(sigB64);
  const ok = await crypto.subtle.verify('HMAC', key, sig, data);
  if (!ok) return null;

  try {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadB64)));
  } catch {
    return null;
  }
}

function getCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k === name) return part.slice(idx + 1).trim();
  }
  return null;
}

function hasGateSession(host, cookieHeader) {
  if (getCookie(cookieHeader, GATE_COOKIE) === '1') return true;
  if (MUSE_TALK_HOSTS.has(host) && cookieHeader.includes('musetalk_iahome_gate=')) return true;
  return false;
}

/**
 * Premier déverrouillage via ?token= : uniquement depuis une navigation IAHome
 * (clic / redirect), pas un copier-coller dans un autre navigateur.
 *
 * - Coller l’URL → Sec-Fetch-Site: none → refusé
 * - Clic depuis iahome.fr → same-site (même si noreferrer)
 * - Fallback Referer apex si Sec-Fetch-* absent
 */
function isTokenUnlockFromIaHome(request) {
  const site = (request.headers.get('Sec-Fetch-Site') || '').toLowerCase();
  if (site === 'same-site' || site === 'same-origin') return true;
  // Collé / saisi / favori
  if (site === 'none') return false;

  const referer = request.headers.get('Referer') || '';
  if (!referer) return false;
  try {
    const rh = new URL(referer).hostname.toLowerCase();
    return rh === 'iahome.fr' || rh === 'www.iahome.fr';
  } catch {
    return false;
  }
}

function gateSetCookieHeader(host) {
  // Host-only cookie (pas de Domain=) → limité au sous-domaine courant
  return `${GATE_COOKIE}=1; Path=/; Max-Age=${GATE_MAX_AGE_SEC}; Secure; HttpOnly; SameSite=Lax`;
}

function isExemptPath(url, request) {
  if (url.pathname.startsWith('/api/')) return true;
  if (url.pathname.startsWith('/cdn-cgi/')) return true;

  const pathLower = url.pathname.toLowerCase();
  if (RESOURCE_EXTENSIONS.some((ext) => pathLower.endsWith(ext))) return true;

  if (
    url.pathname.startsWith('/static/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/gradio_api/') ||
    url.pathname.startsWith('/file=') ||
    url.pathname.startsWith('/queue/') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/robots.txt') ||
    url.pathname.startsWith('/sitemap')
  ) {
    return true;
  }

  const upgrade = request.headers.get('Upgrade') || '';
  const connection = request.headers.get('Connection') || '';
  if (upgrade.toLowerCase() === 'websocket' || connection.toLowerCase().includes('upgrade')) {
    return true;
  }

  const accept = request.headers.get('Accept') || '';
  if (accept.includes('text/event-stream')) return true;

  if (
    url.pathname.includes('/health') ||
    url.pathname.includes('/ping') ||
    url.pathname.includes('/status')
  ) {
    return true;
  }

  return false;
}

/**
 * Requête « document » à protéger : GET/HEAD hors assets/API.
 * (plus seulement GET / — ferme /docs, /login, /pdf, etc.)
 */
function isProtectedNavigation(method, url, request) {
  if (method !== 'GET' && method !== 'HEAD') return false;
  if (isExemptPath(url, request)) return false;

  const dest = (request.headers.get('Sec-Fetch-Dest') || '').toLowerCase();
  if (dest === 'script' || dest === 'style' || dest === 'image' || dest === 'font' || dest === 'worker') {
    return false;
  }

  return true;
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const host = clientHostname(request);
  const method = request.method;
  const jwtSecret = (env && env.JWT_SECRET) || JWT_SECRET_FALLBACK;

  if (host === 'iahome.fr' || host === 'www.iahome.fr') {
    return fetch(request);
  }

  if (HOSTS_SKIP_ALWAYS.has(host) || HOSTS_SKIP_DOCUMENT_TOKEN.has(host)) {
    return fetch(request);
  }

  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE' || method === 'OPTIONS') {
    return fetch(request);
  }

  if (!isProtectedNavigation(method, url, request)) {
    return fetch(request);
  }

  const cookieHeader = request.headers.get('Cookie') || '';
  if (hasGateSession(host, cookieHeader)) {
    return fetch(request);
  }

  const rawToken = url.searchParams.get('token');
  if (rawToken) {
    const payload = await verifyHs256Jwt(rawToken, jwtSecret);
    if (payload && isTokenUnlockFromIaHome(request)) {
      const originResp = await fetch(request);
      const headers = new Headers(originResp.headers);
      headers.append('Set-Cookie', gateSetCookieHeader(host));
      return new Response(originResp.body, {
        status: originResp.status,
        statusText: originResp.statusText,
        headers,
      });
    }
  }

  return Response.redirect(DENY_URL, 302);
}

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  },
};
