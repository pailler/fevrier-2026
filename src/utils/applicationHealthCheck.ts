import type { SupabaseClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { getHunyuan3dAppUrl } from '@/utils/hunyuan3dAppUrl';
import { PRODUCT_LANDING_PUBLIC_HOSTS } from '@/utils/productLandingHosts';
import { RUINEDFOOOCUS_INTERNAL_URL } from '@/utils/ruinedFooocusProxy';
import { STABLEDIFFUSION_INTERNAL_URL } from '@/utils/stableDiffusionProxy';
import { APPRENDRE_AUTREMENT_INTERNAL_URL } from '@/utils/apprendreAutrementProxy';
import { RESAS_SYSTEM_INTERNAL_URL } from '@/utils/resasSystemProxy';
import { REVEIL_INTERNAL_URL } from '@/utils/reveilProxy';

const MODULE_URLS: Record<string, string> = {
  librespeed: 'https://librespeed.iahome.fr',
  metube: 'https://iahome.fr/metube',
  pdf: 'https://pdf.iahome.fr',
  psitransfer: 'https://iahome.fr/psitransfer',
  qrcodes: 'https://qrcodes.iahome.fr',
  whisper: 'https://whisper.iahome.fr',
  stablediffusion: STABLEDIFFUSION_INTERNAL_URL,
  comfyui: 'https://comfyui.iahome.fr',
  'meeting-reports': 'https://meeting-reports.iahome.fr',
  // Internes : mêmes URL que les proxies (host.docker.internal depuis iahome-app)
  ruinedfooocus: RUINEDFOOOCUS_INTERNAL_URL,
  cogstudio: 'https://cogstudio.iahome.fr',
  hunyuan3d: getHunyuan3dAppUrl(),
  'home-assistant': 'https://homeassistant.iahome.fr',
  homeassistant: 'https://homeassistant.iahome.fr',
  'prompt-generator': 'https://prompt-generator.iahome.fr',
  'cv-generator': 'https://cv.iahome.fr',
  'apprendre-autrement': APPRENDRE_AUTREMENT_INTERNAL_URL,
  'ai-detector': 'https://iahome.fr/ai-detector',
  'sentinelle-numerique': 'https://iahome.fr/sentinelle-numerique',
  'code-learning': 'https://code-learning.iahome.fr',
  administration: 'https://iahome.fr/administration',
  'voice-isolation': 'https://voice-isolation.iahome.fr',
  photomaker: 'https://photomaker.iahome.fr',
  photobooth: 'https://photobooth.iahome.fr',
  'animagine-xl': 'https://animaginexl.iahome.fr',
  birefnet: 'https://birefnet.iahome.fr',
  musetalk: 'https://musetalk.iahome.fr',
  'photo-vivante': 'https://photo-vivante.iahome.fr',
  'florence-2': 'https://florence2.iahome.fr',
  vote: 'https://vote.iahome.fr',
  'reveil-intelligent': REVEIL_INTERNAL_URL,
  tts: 'https://tts.iahome.fr',
  'resas-system': RESAS_SYSTEM_INTERNAL_URL,
};

const MODULE_ID_MAPPING: Record<string, string> = {
  '1': 'pdf',
  '2': 'metube',
  '3': 'librespeed',
  '4': 'psitransfer',
  '5': 'qrcodes',
  '7': 'stablediffusion',
  '8': 'ruinedfooocus',
  '10': 'comfyui',
  '11': 'cogstudio',
};

/** Aligné sur cloudflare-worker-protect-sous-domaines.js (landings publiques). */
const WORKER_PUBLIC_LANDING_HOSTS = new Set<string>([
  ...(PRODUCT_LANDING_PUBLIC_HOSTS as readonly string[]),
  'game.iahome.fr',
  'www.game.iahome.fr',
]);

const WORKER_SKIP_ALWAYS_HOSTS = new Set([
  'portainer.iahome.fr',
  'www.portainer.iahome.fr',
  'minecraft.iahome.fr',
  'www.minecraft.iahome.fr',
]);

const DENY_LOCATION_MARKER = 'direct_access_denied';

const JWT_SECRET =
  process.env.JWT_SECRET || 'votre-jwt-secret-tres-securise-changez-cela-immediatement';

export function getModuleSlug(moduleId: string, moduleTitle: string): string {
  if (MODULE_ID_MAPPING[moduleId]) {
    return MODULE_ID_MAPPING[moduleId];
  }

  const slug = moduleId.toLowerCase().replace(/[^a-z0-9-]/g, '');

  if (MODULE_URLS[slug]) {
    return slug;
  }

  const titleLower = moduleTitle.toLowerCase();
  if (titleLower.includes('librespeed') || titleLower.includes('speed')) {
    return 'librespeed';
  }
  if (titleLower.includes('metube') || titleLower.includes('me tube')) {
    return 'metube';
  }
  if (titleLower.includes('psitransfer') || titleLower.includes('psi transfer')) {
    return 'psitransfer';
  }
  if (titleLower.includes('qrcode') || titleLower.includes('qr code')) {
    return 'qrcodes';
  }
  if (titleLower.includes('pdf')) {
    return 'pdf';
  }
  if (titleLower.includes('stablediffusion') || titleLower.includes('stable diffusion')) {
    return 'stablediffusion';
  }
  if (titleLower.includes('ruinedfooocus') || titleLower.includes('ruined fooocus')) {
    return 'ruinedfooocus';
  }
  if (titleLower.includes('comfyui') || titleLower.includes('comfy ui')) {
    return 'comfyui';
  }
  if (titleLower.includes('cogstudio') || titleLower.includes('cog studio')) {
    return 'cogstudio';
  }
  if (titleLower.includes('whisper')) {
    return 'whisper';
  }
  if (titleLower.includes('home assistant') || titleLower.includes('homeassistant')) {
    return 'home-assistant';
  }
  if (titleLower.includes('meeting reports') || titleLower.includes('meeting-reports')) {
    return 'meeting-reports';
  }
  if (titleLower.includes('hunyuan') || titleLower.includes('3d')) {
    return 'hunyuan3d';
  }
  if (titleLower.includes('prompt generator') || titleLower.includes('prompt-generator')) {
    return 'prompt-generator';
  }
  if (titleLower.includes('générateur de cv') || titleLower.includes('cv ia') || titleLower.includes('cv-generator')) {
    return 'cv-generator';
  }
  if (titleLower.includes('photomaker') || titleLower.includes('photo maker')) {
    return 'photomaker';
  }
  if (titleLower.includes('photobooth') || titleLower.includes('photo booth')) {
    return 'photobooth';
  }
  if (titleLower.includes('apprendre autrement') || titleLower.includes('apprendre-autrement')) {
    return 'apprendre-autrement';
  }
  if (
    titleLower.includes('ai detector') ||
    titleLower.includes('ai-detector') ||
    titleLower.includes('détecteur')
  ) {
    return 'ai-detector';
  }
  if (titleLower.includes('sentinelle') || titleLower.includes('sentinelle numérique')) {
    return 'sentinelle-numerique';
  }
  if (titleLower.includes('code learning') || titleLower.includes('code-learning')) {
    return 'code-learning';
  }
  if (titleLower.includes('administration')) {
    return 'administration';
  }
  if (
    titleLower.includes('voice isolation') ||
    titleLower.includes('voice-isolation') ||
    titleLower.includes('isolation vocale')
  ) {
    return 'voice-isolation';
  }
  if (titleLower.includes('animagine') || titleLower.includes('animagine xl')) {
    return 'animagine-xl';
  }
  if (titleLower.includes('birefnet') || titleLower.includes('bi ref net')) {
    return 'birefnet';
  }
  if (titleLower.includes('musetalk') || titleLower.includes('muse talk')) {
    return 'musetalk';
  }
  if (
    titleLower.includes('photo vivante') ||
    titleLower.includes('animation photo') ||
    titleLower.includes('photo realiste')
  ) {
    return 'photo-vivante';
  }
  if (titleLower.includes('florence-2') || titleLower.includes('florence 2')) {
    return 'florence-2';
  }
  if (titleLower.includes('vote en ligne') || (titleLower.includes('vote') && titleLower.includes('scrutin'))) {
    return 'vote';
  }
  if (titleLower.includes('réveil intelligent') || titleLower.includes('reveil intelligent')) {
    return 'reveil-intelligent';
  }
  if (
    titleLower.includes('synthèse vocale') ||
    titleLower.includes('synthese vocale') ||
    titleLower === 'tts'
  ) {
    return 'tts';
  }
  if (
    titleLower.includes('réservation matériel') ||
    titleLower.includes('reservation materiel') ||
    titleLower.includes('resas')
  ) {
    return 'resas-system';
  }

  return slug;
}

export function getModuleUrlForSlug(moduleId: string, moduleTitle: string): string | undefined {
  const slug = getModuleSlug(moduleId, moduleTitle);
  return MODULE_URLS[slug];
}

function isCloudflareEdgeError(status: number): boolean {
  return (
    status === 502 ||
    status === 503 ||
    status === 524 ||
    status === 520 ||
    status === 521 ||
    status === 522 ||
    status === 523 ||
    status === 525 ||
    status === 526 ||
    status === 527
  );
}

function isReachableAppStatus(status: number): boolean {
  // 401 = joignable mais auth app / Access ; 405 = HEAD non supporté
  return (
    ((status >= 200 && status < 400) || status === 401 || status === 405) &&
    !isCloudflareEdgeError(status)
  );
}

export function isWorkerPublicLandingHost(hostname: string): boolean {
  return WORKER_PUBLIC_LANDING_HOSTS.has(hostname.toLowerCase());
}

/**
 * Sous-domaine *.iahome.fr protégé par le worker (hors landings / infra).
 */
export function isWorkerTokenGatedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (!host.endsWith('.iahome.fr')) return false;
  if (host === 'iahome.fr' || host === 'www.iahome.fr') return false;
  if (WORKER_SKIP_ALWAYS_HOSTS.has(host)) return false;
  if (isWorkerPublicLandingHost(host)) return false;
  return true;
}

function issueHealthCheckToken(moduleSlug: string): string {
  return jwt.sign(
    {
      userId: 'iahome-health-check',
      userEmail: 'health-check@iahome.fr',
      moduleId: moduleSlug || 'health-check',
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = 15000, ...rest } = init;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Vérifie un sous-domaine protégé par le worker Cloudflare :
 * 1) sans token → 302 direct_access_denied (gate OK)
 * 2) avec JWT + Sec-Fetch-Site same-site → app joignable
 */
async function checkTokenGatedSubdomain(
  url: string,
  moduleSlug: string
): Promise<{
  isValid: boolean;
  statusCode?: number;
  errorMessage?: string;
  responseTime?: number;
  isCloudflareError?: boolean;
  gateOk?: boolean;
  originOk?: boolean;
}> {
  const startTime = Date.now();
  const parsed = new URL(url);
  const bareUrl = `${parsed.origin}${parsed.pathname || '/'}`;

  try {
    const gateResp = await fetchWithTimeout(bareUrl, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IAHome-Health-Checker/1.0)',
        Accept: 'text/html',
      },
    });

    const location = gateResp.headers.get('location') || '';
    const gateOk =
      [301, 302, 303, 307, 308].includes(gateResp.status) &&
      location.includes(DENY_LOCATION_MARKER);

    if (!gateOk) {
      const responseTime = Date.now() - startTime;
      if (isReachableAppStatus(gateResp.status)) {
        return {
          isValid: false,
          statusCode: gateResp.status,
          responseTime,
          gateOk: false,
          originOk: true,
          errorMessage:
            'Worker: accès direct ouvert (attendu 302 direct_access_denied sans token)',
        };
      }
      return {
        isValid: false,
        statusCode: gateResp.status,
        responseTime,
        gateOk: false,
        isCloudflareError: isCloudflareEdgeError(gateResp.status),
        errorMessage: `Worker: gate inattendu (HTTP ${gateResp.status}${location ? ` → ${location}` : ''})`,
      };
    }

    const token = issueHealthCheckToken(moduleSlug);
    const probeUrl = `${bareUrl}${bareUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
    const originResp = await fetchWithTimeout(probeUrl, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IAHome-Health-Checker/1.0)',
        Accept: 'text/html',
        'Sec-Fetch-Site': 'same-site',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Dest': 'document',
        Referer: 'https://iahome.fr/admin/applications',
      },
    });

    const responseTime = Date.now() - startTime;
    const originStatus = originResp.status;
    // Après unlock le worker peut 302 vers une autre page app, ou 200
    let originOk = isReachableAppStatus(originStatus);
    if (
      !originOk &&
      [301, 302, 303, 307, 308].includes(originStatus)
    ) {
      const loc = originResp.headers.get('location') || '';
      // Redirection vers encours = token / same-site refusés
      originOk = !loc.includes(DENY_LOCATION_MARKER);
    }

    if (!originOk) {
      return {
        isValid: false,
        statusCode: originStatus,
        responseTime,
        gateOk: true,
        originOk: false,
        isCloudflareError: isCloudflareEdgeError(originStatus),
        errorMessage: isCloudflareEdgeError(originStatus)
          ? `Erreur Cloudflare origine (${originStatus}) — gate OK`
          : `Origine injoignable (HTTP ${originStatus}) — gate OK`,
      };
    }

    return {
      isValid: true,
      statusCode: originStatus,
      responseTime,
      gateOk: true,
      originOk: true,
    };
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    const err = error as { message?: string; name?: string };
    let errorMessage = err.message || 'Erreur inconnue';
    if (err.name === 'AbortError') {
      errorMessage = 'Timeout (dépassement de 15 secondes)';
    } else if (err.message?.includes('fetch failed')) {
      errorMessage = 'Erreur de connexion réseau';
    }
    return {
      isValid: false,
      errorMessage,
      responseTime,
      gateOk: false,
      originOk: false,
    };
  }
}

export async function checkApplicationUrl(
  url: string,
  options?: { moduleSlug?: string }
): Promise<{
  isValid: boolean;
  statusCode?: number;
  errorMessage?: string;
  responseTime?: number;
  isCloudflareError?: boolean;
  gateOk?: boolean;
  originOk?: boolean;
}> {
  let hostname = '';
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return { isValid: false, errorMessage: 'URL invalide' };
  }

  const moduleSlug =
    options?.moduleSlug ||
    hostname.replace(/^www\./, '').replace(/\.iahome\.fr$/, '') ||
    'health-check';

  if (isWorkerTokenGatedHost(hostname)) {
    return checkTokenGatedSubdomain(url, moduleSlug);
  }

  const startTime = Date.now();

  try {
    const response = await fetchWithTimeout(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IAHome-Health-Checker/1.0)',
      },
    });

    const responseTime = Date.now() - startTime;
    const isCloudflareErrorCode = isCloudflareEdgeError(response.status);
    const isValid = isReachableAppStatus(response.status);

    let errorMessage: string | undefined;
    let isCloudflareError = false;

    if (!isValid) {
      if (isCloudflareErrorCode) {
        errorMessage = `Erreur Cloudflare (${response.status})`;
        isCloudflareError = true;
      } else if (response.status === 404) {
        errorMessage = '404 - Page non trouvée';
      } else if (response.status === 502) {
        errorMessage = '502 - Bad Gateway';
      } else if (response.status === 503) {
        errorMessage = '503 - Service indisponible';
      } else {
        errorMessage = `Status code: ${response.status}`;
      }
    } else if (isWorkerPublicLandingHost(hostname)) {
      // Landing publique : 200 attendu (pas de gate)
      return {
        isValid: true,
        statusCode: response.status,
        responseTime,
        gateOk: false,
        originOk: true,
      };
    }

    return {
      isValid,
      statusCode: response.status,
      responseTime,
      errorMessage,
      isCloudflareError,
    };
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    const err = error as { message?: string; name?: string };
    let errorMessage = err.message || 'Erreur inconnue';
    if (err.name === 'AbortError') {
      errorMessage = 'Timeout (dépassement de 15 secondes)';
    } else if (err.message?.includes('fetch failed')) {
      errorMessage = 'Erreur de connexion réseau';
    }

    return {
      isValid: false,
      errorMessage,
      responseTime,
    };
  }
}

export type ModuleHealthRow = {
  module_id: string;
  module_name: string;
  url: string | null;
  isValid: boolean;
  isSkipped?: boolean;
  errorMessage?: string;
  responseTime?: number;
  statusCode?: number;
  isCloudflareError?: boolean;
  gateOk?: boolean;
  originOk?: boolean;
};

export async function runAllModulesHealthCheck(
  supabase: SupabaseClient
): Promise<ModuleHealthRow[]> {
  const { data: modulesData, error: modulesError } = await supabase
    .from('modules')
    .select('id, title')
    .order('created_at', { ascending: false });

  if (modulesError) {
    throw modulesError;
  }

  const results: ModuleHealthRow[] = [];
  for (const moduleEntry of modulesData || []) {
    const moduleSlug = getModuleSlug(moduleEntry.id, moduleEntry.title);
    const moduleUrl = MODULE_URLS[moduleSlug];

    if (!moduleUrl) {
      results.push({
        module_id: moduleEntry.id,
        module_name: moduleEntry.title,
        url: null,
        isValid: true,
        isSkipped: true,
        errorMessage: `Module ignoré (hors périmètre IAHome) - slug: ${moduleSlug}`,
        responseTime: 0,
      });
      continue;
    }

    const checkResult = await checkApplicationUrl(moduleUrl, { moduleSlug });

    results.push({
      module_id: moduleEntry.id,
      module_name: moduleEntry.title,
      url: moduleUrl,
      ...checkResult,
    });
  }

  return results;
}
