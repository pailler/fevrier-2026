import { PRODUCT_LANDING_PUBLIC_HOSTS } from '@/utils/productLandingHosts';

/** Routes sans bannière / footer globaux IAHome (landings produit ou apps plein écran). */
export const PATHS_WITHOUT_SITE_CHROME = [
  '/code-learning',
  '/photobooth',
  '/psitransfer',
  '/metube',
  '/ruinedfooocus',
  '/stablediffusion',
  '/resas-system',
  '/apprendre-autrement',
  '/reveil',
  '/administration',
  '/ai-detector',
  '/sentinelle-numerique',
  '/exemple-seo',
  '/product-landing',
] as const;

/** Hôtes dont la landing produit remplace le chrome IAHome (rewrite middleware → pathname `/`). */
export const HOSTS_WITHOUT_SITE_CHROME = [...PRODUCT_LANDING_PUBLIC_HOSTS] as const;

function normalizeHost(host: string | null | undefined): string {
  if (!host) return '';
  return host.split(':')[0].toLowerCase().replace(/\.$/, '');
}

export function isHostWithoutSiteChrome(host: string | null | undefined): boolean {
  const normalized = normalizeHost(host);
  if (!normalized) return false;
  return (HOSTS_WITHOUT_SITE_CHROME as readonly string[]).includes(normalized);
}

export function isPathWithoutSiteChrome(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return PATHS_WITHOUT_SITE_CHROME.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function shouldHideSiteChrome(
  pathname: string | null | undefined,
  host?: string | null | undefined
): boolean {
  return isHostWithoutSiteChrome(host) || isPathWithoutSiteChrome(pathname);
}
