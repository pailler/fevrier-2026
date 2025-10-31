/**
 * Configuration et utilitaires pour Cloudflare Access
 */

// Configuration Cloudflare Access
const CLOUDFLARE_ACCESS_CONFIG = {
  teamDomain: process.env.NEXT_PUBLIC_CLOUDFLARE_ACCESS_TEAM_DOMAIN || 'iahome-block.cloudflareaccess.com',
  audTag: process.env.NEXT_PUBLIC_CLOUDFLARE_ACCESS_AUD_TAG || '274cbdc2721dc9ca27fb17c5bfc0dc761eff8c4152df8f7f5ed4dc32b8b83c82',
};

/**
 * Génère l'URL Cloudflare Access pour un sous-domaine donné
 * @param subdomain - Le sous-domaine cible (ex: 'librespeed.iahome.fr')
 * @param redirectPath - Le chemin de redirection (optionnel, par défaut '/')
 * @returns L'URL Cloudflare Access complète
 */
export function getCloudflareAccessUrl(subdomain: string, redirectPath: string = '/'): string {
  const redirectUrl = encodeURIComponent(`https://${subdomain}${redirectPath}`);
  return `https://${CLOUDFLARE_ACCESS_CONFIG.teamDomain}/cdn-cgi/access/login/${subdomain}?kid=${CLOUDFLARE_ACCESS_CONFIG.audTag}&redirect_url=${redirectUrl}`;
}

/**
 * Mapping des modules vers leurs sous-domaines
 */
export const MODULE_SUBDOMAINS: Record<string, string> = {
  librespeed: 'librespeed.iahome.fr',
  metube: 'metube.iahome.fr',
  pdf: 'pdf.iahome.fr',
  psitransfer: 'psitransfer.iahome.fr',
  qrcodes: 'qrcodes.iahome.fr',
  whisper: 'whisper.iahome.fr',
  stablediffusion: 'stablediffusion.iahome.fr',
  comfyui: 'comfyui.iahome.fr',
  ruinedfooocus: 'ruinedfooocus.iahome.fr',
  cogstudio: 'cogstudio.iahome.fr',
  'meeting-reports': 'meeting-reports.iahome.fr',
};

/**
 * Génère l'URL Cloudflare Access pour un module donné
 * @param moduleId - L'ID du module (ex: 'librespeed', 'metube')
 * @param redirectPath - Le chemin de redirection (optionnel)
 * @returns L'URL Cloudflare Access ou null si le module n'existe pas
 */
export function getModuleAccessUrl(moduleId: string, redirectPath: string = '/'): string | null {
  const subdomain = MODULE_SUBDOMAINS[moduleId];
  if (!subdomain) {
    return null;
  }
  return getCloudflareAccessUrl(subdomain, redirectPath);
}

