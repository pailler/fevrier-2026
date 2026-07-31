/**
 * Même logique que cloudflare-worker-protect-sous-domaines.js — format **Modules** Cloudflare Workers
 * (export default { fetch }). À coller si le worker « protect-sous-domaines-iahome » est en mode ES modules.
 */

const HOSTS_SKIP_DOCUMENT_TOKEN = new Set([
  'photobooth.iahome.fr',
  'www.photobooth.iahome.fr',
  'resas.iahome.fr',
  'game.iahome.fr',
]);

const MUSE_TALK_HOSTS = new Set(['musetalk.iahome.fr', 'www.musetalk.iahome.fr']);
const REVEIL_HOSTS = new Set(['reveil-intelligent.iahome.fr', 'www.reveil-intelligent.iahome.fr']);

function clientHostname(request) {
  let fromUrl = '';
  try {
    fromUrl = new URL(request.url).hostname.toLowerCase();
  } catch {
    fromUrl = '';
  }
  const raw =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('X-Forwarded-Host') ||
    request.headers.get('host') ||
    request.headers.get('Host') ||
    '';
  let h = raw.split(',')[0].trim().split(':')[0].toLowerCase() || fromUrl;
  if (h.endsWith('.')) h = h.slice(0, -1);
  return h || fromUrl;
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const method = request.method;
  const host = clientHostname(request);

  if (HOSTS_SKIP_DOCUMENT_TOKEN.has(host)) {
    return fetch(request);
  }

  if (url.pathname.startsWith('/api/')) {
    return fetch(request);
  }

  if (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'OPTIONS') {
    return fetch(request);
  }

  const resourceExtensions = [
    '.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.json',
    '.xml', '.pdf', '.zip', '.txt', '.map', '.webp', '.avif',
    '.otf',
  ];

  const isResource = resourceExtensions.some((ext) =>
    url.pathname.toLowerCase().endsWith(ext)
  );

  const isStaticPath =
    url.pathname.startsWith('/static/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/favicon.ico');

  const isWebSocket =
    request.headers.get('Upgrade') === 'websocket' ||
    (request.headers.get('Connection') || '').includes('Upgrade');

  const isSSE = (request.headers.get('Accept') || '').includes('text/event-stream');

  const isHealthCheck =
    url.pathname.includes('/health') ||
    url.pathname.includes('/ping') ||
    url.pathname.includes('/status');

  if (isResource || isStaticPath || isWebSocket || isSSE || isHealthCheck) {
    return fetch(request);
  }

  const isMainRequest =
    method === 'GET' &&
    (url.pathname === '/' ||
      url.pathname === '' ||
      url.pathname.toLowerCase() === '/index.html' ||
      url.pathname.toLowerCase().endsWith('/index'));

  if (isMainRequest) {
    const hasToken = url.searchParams.has('token');
    const cookieHeader = request.headers.get('Cookie') || '';
    const musetalkSession =
      MUSE_TALK_HOSTS.has(host) && cookieHeader.includes('musetalk_iahome_gate=');
    const reveilSession =
      REVEIL_HOSTS.has(host) && cookieHeader.includes('reveil_iahome_gate=');

    if (!hasToken && !musetalkSession && !reveilSession) {
      return Response.redirect('https://iahome.fr/encours?error=direct_access_denied', 302);
    }
    return fetch(request);
  }

  return fetch(request);
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  },
};
