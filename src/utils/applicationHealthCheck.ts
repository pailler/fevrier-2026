import type { SupabaseClient } from '@supabase/supabase-js';
import { getHunyuan3dAppUrl } from '@/utils/hunyuan3dAppUrl';

const MODULE_URLS: Record<string, string> = {
  librespeed: 'https://librespeed.iahome.fr',
  metube: 'https://metube.iahome.fr',
  pdf: 'https://pdf.iahome.fr',
  psitransfer: 'https://psitransfer.iahome.fr',
  qrcodes: 'https://qrcodes.iahome.fr',
  whisper: 'https://whisper.iahome.fr',
  stablediffusion: 'https://stablediffusion.iahome.fr',
  comfyui: 'https://comfyui.iahome.fr',
  'meeting-reports': 'https://meeting-reports.iahome.fr',
  ruinedfooocus: 'https://ruinedfooocus.iahome.fr',
  cogstudio: 'https://cogstudio.iahome.fr',
  hunyuan3d: getHunyuan3dAppUrl(),
  'home-assistant': 'https://homeassistant.iahome.fr',
  homeassistant: 'https://homeassistant.iahome.fr',
  'prompt-generator': 'https://prompt-generator.iahome.fr',
  'apprendre-autrement': 'https://apprendre-autrement.iahome.fr',
  'ai-detector': 'https://iahome.fr/ai-detector',
  'sentinelle-numerique': 'https://iahome.fr/sentinelle-numerique',
  'code-learning': 'https://iahome.fr/code-learning',
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
  'reveil-intelligent': 'https://reveil-intelligent.iahome.fr',
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

  return slug;
}

export function getModuleUrlForSlug(moduleId: string, moduleTitle: string): string | undefined {
  const slug = getModuleSlug(moduleId, moduleTitle);
  return MODULE_URLS[slug];
}

export async function checkApplicationUrl(url: string): Promise<{
  isValid: boolean;
  statusCode?: number;
  errorMessage?: string;
  responseTime?: number;
  isCloudflareError?: boolean;
}> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IAHome-Health-Checker/1.0)',
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    const isCloudflareErrorCode =
      response.status === 502 ||
      response.status === 503 ||
      response.status === 524 ||
      response.status === 520 ||
      response.status === 521 ||
      response.status === 522 ||
      response.status === 523 ||
      response.status === 525 ||
      response.status === 526 ||
      response.status === 527;

    const isValid =
      ((response.status >= 200 && response.status < 400) || response.status === 405) &&
      !isCloudflareErrorCode;

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

    const checkResult = await checkApplicationUrl(moduleUrl);

    results.push({
      module_id: moduleEntry.id,
      module_name: moduleEntry.title,
      url: moduleUrl,
      ...checkResult,
    });
  }

  return results;
}
