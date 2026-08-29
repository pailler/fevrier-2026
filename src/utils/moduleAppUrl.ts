import { getHunyuan3dAppUrl } from '@/utils/hunyuan3dAppUrl';
import { isBrowserLocalIahomeDev } from '@/utils/isBrowserLocalIahomeDev';
import { moduleTokenSessionKey } from '@/utils/moduleAccessJwt';

const SUBDOMAIN_ALIASES: Record<string, string> = {
  'animagine-xl': 'animaginexl',
  'florence-2': 'florence2',
  'home-assistant': 'homeassistant',
};

/** Routes Next intégrées (même domaine iahome.fr). */
export const INTERNAL_MODULE_ROUTES = new Set([
  'code-learning',
  'photobooth',
  'psitransfer',
  'metube',
  'ruinedfooocus',
  'stablediffusion',
  'resas-system',
  'apprendre-autrement',
  'reveil-intelligent',
  'reveil',
  'administration',
  'ai-detector',
  'sentinelle-numerique',
]);

/** URLs applicatives (Gradio / sous-domaines / routes internes) — dev vs prod. */
export function getModuleAppUrl(moduleId: string): string {
  const normalizedModuleId = (moduleId || '').trim().toLowerCase();
  const isDevelopment = isBrowserLocalIahomeDev();

  const urlMap: Record<string, string> = isDevelopment
    ? {
        librespeed: 'http://localhost:8085',
        metube: '/metube',
        qrcodes: 'http://localhost:7006',
        photomaker: 'http://localhost:7881',
        birefnet: 'http://localhost:7882',
        'animagine-xl': 'http://localhost:7883',
        'sentinelle-numerique': 'http://localhost:3000/sentinelle-numerique',
        'florence-2': 'http://localhost:7884',
        musetalk: 'http://localhost:7886',
        'photo-vivante': 'http://localhost:7887',
        'home-assistant': 'http://localhost:8123',
        hunyuan3d: getHunyuan3dAppUrl(),
        'meeting-reports': 'http://localhost:3050',
        whisper: 'http://localhost:8093',
        ruinedfooocus: '/ruinedfooocus',
        '8': '/ruinedfooocus',
        stablediffusion: '/stablediffusion',
        '7': '/stablediffusion',
        comfyui: 'http://localhost:8188',
        cogstudio: 'http://localhost:8080',
        'apprendre-autrement': '/apprendre-autrement',
        photobooth: 'http://localhost:7885',
        vote: 'http://localhost:7890',
        'reveil-intelligent': '/reveil',
        reveil: '/reveil',
        'prompt-generator': 'https://prompt-generator.iahome.fr',
        'cv-generator': 'http://localhost:3003',
        'code-learning': '/code-learning',
        psitransfer: '/psitransfer',
        administration: '/administration',
        'ai-detector': '/ai-detector',
        tts: 'http://localhost:8101',
        'voice-isolation': 'http://localhost:8100',
        'resas-system': '/resas-system',
      }
    : {
        librespeed: 'https://librespeed.iahome.fr',
        metube: '/metube',
        psitransfer: '/psitransfer',
        qrcodes: 'https://qrcodes.iahome.fr',
        photomaker: 'https://photomaker.iahome.fr',
        birefnet: 'https://birefnet.iahome.fr',
        'animagine-xl': 'https://animaginexl.iahome.fr',
        'sentinelle-numerique': 'https://iahome.fr/sentinelle-numerique',
        'florence-2': 'https://florence2.iahome.fr',
        musetalk: 'https://musetalk.iahome.fr',
        'photo-vivante': 'https://photo-vivante.iahome.fr',
        'home-assistant': 'https://homeassistant.iahome.fr',
        hunyuan3d: getHunyuan3dAppUrl(),
        'meeting-reports': 'https://meeting-reports.iahome.fr',
        whisper: 'https://whisper.iahome.fr',
        // App Gradio via proxy Next → /ruinedfooocus?token=… (landing = ruinedfooocus.iahome.fr)
        ruinedfooocus: '/ruinedfooocus',
        '8': '/ruinedfooocus',
        // App Gradio via proxy Next → /stablediffusion?token=… (landing = stablediffusion.iahome.fr)
        stablediffusion: '/stablediffusion',
        '7': '/stablediffusion',
        comfyui: 'https://comfyui.iahome.fr',
        cogstudio: 'https://cogstudio.iahome.fr',
        'apprendre-autrement': '/apprendre-autrement',
        photobooth: '/photobooth',
        vote: 'https://vote.iahome.fr',
        // App via proxy Next → /reveil?token=… (landing = reveil.iahome.fr)
        'reveil-intelligent': '/reveil',
        reveil: '/reveil',
        'prompt-generator': 'https://prompt-generator.iahome.fr',
        'cv-generator': 'https://cv.iahome.fr',
        'code-learning': '/code-learning',
        administration: '/administration',
        'ai-detector': '/ai-detector',
        pdf: 'https://pdf.iahome.fr',
        tts: 'https://tts.iahome.fr',
        'voice-isolation': 'https://voice-isolation.iahome.fr',
        'resas-system': '/resas-system',
      };

  if (urlMap[normalizedModuleId]) {
    return urlMap[normalizedModuleId];
  }

  const computedSubdomain = SUBDOMAIN_ALIASES[normalizedModuleId] || normalizedModuleId;
  return computedSubdomain ? `https://${computedSubdomain}.iahome.fr` : '';
}

export function isInternalModuleAppUrl(baseUrl: string, moduleId?: string): boolean {
  const id = (moduleId || '').trim().toLowerCase();
  if (id && INTERNAL_MODULE_ROUTES.has(id)) return true;
  if (baseUrl.startsWith('/')) return true;
  if (typeof window !== 'undefined') {
    try {
      const origin = window.location.origin;
      if (baseUrl.startsWith(origin + '/')) return true;
      if (baseUrl.startsWith('https://iahome.fr/') || baseUrl.startsWith('http://iahome.fr/')) return true;
    } catch {
      // ignore
    }
  }
  return false;
}

/**
 * Onglet vide au clic (sans noopener : sinon window.open retourne null et on ne peut pas naviguer l'onglet).
 */
export function openPendingModuleTab(): Window | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.open('about:blank', '_blank');
  } catch {
    return null;
  }
}

/** URL absolue avec jeton JWT. */
export function buildModuleAppUrlWithToken(
  moduleId: string,
  token: string,
  baseUrl?: string
): string {
  const targetUrl = baseUrl || getModuleAppUrl(moduleId);
  if (!targetUrl) {
    throw new Error(`URL d'accès introuvable pour le module ${moduleId}`);
  }

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://iahome.fr';
  const u = targetUrl.startsWith('/')
    ? new URL(targetUrl, origin)
    : new URL(targetUrl);
  u.searchParams.set('token', token);
  return u.toString();
}

function stashModuleTokenForCrossOriginNavigation(
  moduleId: string,
  token: string,
  targetUrl: string
): void {
  if (typeof window === 'undefined') return;
  const origin = window.location.origin;
  const targetOrigin = targetUrl.startsWith('/')
    ? origin
    : new URL(targetUrl, origin).origin;
  if (targetOrigin !== origin) {
    sessionStorage.setItem(moduleTokenSessionKey(moduleId), token);
  }
}

/** Lit le jeton stocké avant navigation cross-origin (prioritaire sur l’URL). */
export function consumeStashedModuleToken(moduleId: string): string | null {
  if (typeof window === 'undefined') return null;
  const key = moduleTokenSessionKey(moduleId);
  const token = sessionStorage.getItem(key);
  if (token) sessionStorage.removeItem(key);
  return token;
}

/** Ouvre l'application module avec jeton JWT (toujours nouvel onglet / fenêtre). */
export function openModuleAppWithToken(
  moduleId: string,
  token: string,
  baseUrl?: string,
  pendingWindow?: Window | null
): void {
  const resolvedBase = baseUrl || getModuleAppUrl(moduleId);
  stashModuleTokenForCrossOriginNavigation(moduleId, token, resolvedBase);
  const fullUrl = buildModuleAppUrlWithToken(moduleId, token, resolvedBase);

  if (pendingWindow && !pendingWindow.closed) {
    try {
      pendingWindow.location.href = fullUrl;
      try {
        pendingWindow.focus();
      } catch {
        // ignore
      }
      return;
    } catch {
      // repli ci-dessous
    }
  }

  const opened = window.open(fullUrl, '_blank');
  if (!opened) {
    window.location.assign(fullUrl);
  }
}

/** Redirection login fiable (évite router.push parfois silencieux). */
export function redirectToLogin(returnPath: string): void {
  const path = returnPath.startsWith('/') ? returnPath : `/${returnPath}`;
  const url = `/login?redirect=${encodeURIComponent(path)}`;
  if (typeof window !== 'undefined') {
    window.location.assign(url);
  }
}
