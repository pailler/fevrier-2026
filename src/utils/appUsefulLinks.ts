export interface UsefulLink {
  label: string;
  url: string;
  icon?: string;
}

export interface AppLinks {
  [key: string]: UsefulLink[];
}

// Mapping des applications vers leurs liens utiles
export const appUsefulLinks: AppLinks = {
  'pdf': [
    { label: 'GitHub', url: 'https://github.com/Stirling-Tools/Stirling-PDF', icon: '🔗' },
    { label: 'Documentation', url: 'https://github.com/Stirling-Tools/Stirling-PDF#readme', icon: '📚' },
  ],
  'metube': [
    { label: 'GitHub', url: 'https://github.com/alexta69/metube', icon: '🔗' },
    { label: 'Documentation', url: 'https://github.com/alexta69/metube#readme', icon: '📚' },
  ],
  'whisper': [
    { label: 'GitHub OpenAI', url: 'https://github.com/openai/whisper', icon: '🔗' },
    { label: 'Documentation', url: 'https://github.com/openai/whisper#readme', icon: '📚' },
  ],
  'psitransfer': [
    { label: 'GitHub', url: 'https://github.com/psi-4ward/psitransfer', icon: '🔗' },
    { label: 'Documentation', url: 'https://github.com/psi-4ward/psitransfer#readme', icon: '📚' },
  ],
  'qrcodes': [
    { label: 'Documentation QR Codes', url: 'https://www.qrcode.com', icon: '📚' },
    { label: 'Wikipedia QR Code', url: 'https://fr.wikipedia.org/wiki/QR_Code', icon: '🌐' },
  ],
  'stablediffusion': [
    { label: 'GitHub Stable Diffusion', url: 'https://github.com/Stability-AI/stablediffusion', icon: '🔗' },
    { label: 'Documentation', url: 'https://github.com/Stability-AI/stablediffusion#readme', icon: '📚' },
  ],
  'comfyui': [
    { label: 'GitHub', url: 'https://github.com/comfyanonymous/ComfyUI', icon: '🔗' },
    { label: 'Documentation', url: 'https://github.com/comfyanonymous/ComfyUI#readme', icon: '📚' },
  ],
  'ruinedfooocus': [
    { label: 'GitHub', url: 'https://github.com/lllyasviel/Fooocus', icon: '🔗' },
    { label: 'Documentation', url: 'https://github.com/lllyasviel/Fooocus#readme', icon: '📚' },
  ],
  'hunyuan3d': [
    { label: 'GitHub Tencent', url: 'https://github.com/Tencent/Hunyuan3D', icon: '🔗' },
    { label: 'Documentation', url: 'https://github.com/Tencent/Hunyuan3D#readme', icon: '📚' },
  ],
  'code-learning': [
    { label: 'MDN JavaScript', url: 'https://developer.mozilla.org/fr/docs/Web/JavaScript', icon: '🟨' },
    { label: 'JavaScript (guide)', url: 'https://javascript.info', icon: '📚' },
    { label: 'Code.org (enfants)', url: 'https://code.org', icon: '🧒' },
  ],
  'meeting-reports': [
    { label: 'Documentation OpenAI Whisper', url: 'https://github.com/openai/whisper', icon: '🔗' },
    { label: 'API OpenAI', url: 'https://platform.openai.com/docs', icon: '📚' },
  ],
  'librespeed': [
    { label: 'GitHub', url: 'https://github.com/librespeed/speedtest', icon: '🔗' },
    { label: 'Site officiel', url: 'https://librespeed.org', icon: '🌐' },
  ],
  'prompt-generator': [
    { label: 'Prompt Engineering Guide', url: 'https://www.promptingguide.ai/fr', icon: '📖' },
    { label: 'OpenAI Best Practices', url: 'https://platform.openai.com/docs/guides/prompt-engineering', icon: '🤖' },
  ],
};

// Fonction helper pour obtenir les liens d'une application
export function getAppLinks(appId: string): UsefulLink[] {
  const normalizedId = appId.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return appUsefulLinks[normalizedId] || appUsefulLinks[appId] || [];
}

