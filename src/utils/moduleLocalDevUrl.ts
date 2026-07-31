import { getHunyuan3dAppUrl } from '@/utils/hunyuan3dAppUrl';

/** Slugs reconnus (alignés sur check-health / unified-redirect). */
const KNOWN_MODULE_SLUGS = new Set([
  'librespeed',
  'metube',
  'pdf',
  'psitransfer',
  'qrcodes',
  'whisper',
  'stablediffusion',
  'comfyui',
  'meeting-reports',
  'ruinedfooocus',
  'cogstudio',
  'hunyuan3d',
  'home-assistant',
  'homeassistant',
  'prompt-generator',
  'apprendre-autrement',
  'ai-detector',
  'sentinelle-numerique',
  'code-learning',
  'administration',
  'voice-isolation',
  'photomaker',
  'photobooth',
  'animagine-xl',
  'birefnet',
  'musetalk',
  'photo-vivante',
  'florence-2',
  'vote',
  'reveil-intelligent',
]);

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

/**
 * Slug module pour affichage admin (même logique que getModuleSlug côté check-health).
 */
export function getModuleSlugForAdminLocalUrl(moduleId: string, moduleTitle: string): string {
  if (MODULE_ID_MAPPING[moduleId]) {
    return MODULE_ID_MAPPING[moduleId];
  }

  const slug = moduleId.toLowerCase().replace(/[^a-z0-9-]/g, '');

  if (KNOWN_MODULE_SLUGS.has(slug)) {
    return slug;
  }

  const titleLower = (moduleTitle || '').toLowerCase();
  if (titleLower.includes('librespeed') || titleLower.includes('speed')) return 'librespeed';
  if (titleLower.includes('metube') || titleLower.includes('me tube')) return 'metube';
  if (titleLower.includes('psitransfer') || titleLower.includes('psi transfer')) return 'psitransfer';
  if (titleLower.includes('qrcode') || titleLower.includes('qr code')) return 'qrcodes';
  if (titleLower.includes('pdf')) return 'pdf';
  if (titleLower.includes('stablediffusion') || titleLower.includes('stable diffusion')) return 'stablediffusion';
  if (titleLower.includes('ruinedfooocus') || titleLower.includes('ruined fooocus')) return 'ruinedfooocus';
  if (titleLower.includes('comfyui') || titleLower.includes('comfy ui')) return 'comfyui';
  if (titleLower.includes('cogstudio') || titleLower.includes('cog studio')) return 'cogstudio';
  if (titleLower.includes('whisper')) return 'whisper';
  if (titleLower.includes('home assistant') || titleLower.includes('homeassistant')) return 'home-assistant';
  if (titleLower.includes('meeting reports') || titleLower.includes('meeting-reports')) return 'meeting-reports';
  if (titleLower.includes('hunyuan') || titleLower.includes('3d')) return 'hunyuan3d';
  if (titleLower.includes('prompt generator') || titleLower.includes('prompt-generator')) return 'prompt-generator';
  if (titleLower.includes('photomaker') || titleLower.includes('photo maker')) return 'photomaker';
  if (titleLower.includes('photobooth') || titleLower.includes('photo booth')) return 'photobooth';
  if (titleLower.includes('apprendre autrement') || titleLower.includes('apprendre-autrement')) return 'apprendre-autrement';
  if (titleLower.includes('ai detector') || titleLower.includes('ai-detector') || titleLower.includes('détecteur')) return 'ai-detector';
  if (titleLower.includes('sentinelle') || titleLower.includes('sentinelle numérique')) return 'sentinelle-numerique';
  if (titleLower.includes('code learning') || titleLower.includes('code-learning')) return 'code-learning';
  if (titleLower.includes('administration')) return 'administration';
  if (titleLower.includes('voice isolation') || titleLower.includes('voice-isolation') || titleLower.includes('isolation vocale')) return 'voice-isolation';
  if (titleLower.includes('animagine') || titleLower.includes('animagine xl')) return 'animagine-xl';
  if (titleLower.includes('birefnet') || titleLower.includes('bi ref net')) return 'birefnet';
  if (titleLower.includes('musetalk') || titleLower.includes('muse talk')) return 'musetalk';
  if (
    titleLower.includes('photo vivante') ||
    titleLower.includes('animation photo') ||
    titleLower.includes('photo realiste')
  ) return 'photo-vivante';
  if (titleLower.includes('florence-2') || titleLower.includes('florence 2')) return 'florence-2';
  if (titleLower.includes('vote en ligne') || titleLower.includes('vote')) return 'vote';
  if (titleLower.includes('réveil intelligent') || titleLower.includes('reveil intelligent')) return 'reveil-intelligent';

  return slug;
}

const SLUG_TO_LOCAL: Record<string, string> = {
  librespeed: 'http://localhost:8085',
  metube: 'http://localhost:8081',
  pdf: 'http://localhost:8086',
  psitransfer: 'http://localhost:8087',
  qrcodes: 'http://localhost:7006',
  whisper: 'http://localhost:8093',
  stablediffusion: 'http://localhost:7880',
  comfyui: 'http://localhost:8188',
  'meeting-reports': 'http://localhost:3050',
  ruinedfooocus: 'http://localhost:7870',
  cogstudio: 'http://localhost:8080',
  'home-assistant': 'http://localhost:8123',
  homeassistant: 'http://localhost:8123',
  'prompt-generator': 'http://localhost:3002',
  'apprendre-autrement': 'http://localhost:9001',
  'ai-detector': 'http://localhost:3000/ai-detector',
  'sentinelle-numerique': 'http://localhost:3000/sentinelle-numerique',
  'code-learning': 'http://localhost:3000/code-learning',
  administration: 'http://localhost:3000/administration',
  'voice-isolation': 'http://localhost:8100',
  photomaker: 'http://localhost:7881',
  photobooth: 'http://localhost:7885',
  'animagine-xl': 'http://localhost:7883',
  birefnet: 'http://localhost:7882',
  musetalk: 'http://localhost:7886',
  'photo-vivante': 'http://localhost:7887',
  'florence-2': 'http://localhost:7884',
  vote: 'http://localhost:7890',
  'reveil-intelligent': 'http://localhost:7891',
};

/**
 * URL de développement local typique pour un module (admin uniquement).
 * Retourne null si aucune correspondance connue.
 */
export function getLocalDevUrlForModule(moduleId: string, moduleTitle: string): string | null {
  const slug = getModuleSlugForAdminLocalUrl(moduleId, moduleTitle);
  if (slug === 'hunyuan3d') {
    try {
      return getHunyuan3dAppUrl() || null;
    } catch {
      return null;
    }
  }
  const url = SLUG_TO_LOCAL[slug];
  if (!url) return null;
  return url;
}
