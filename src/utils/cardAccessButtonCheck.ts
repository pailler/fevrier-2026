import fs from 'fs';
import path from 'path';
import type { SupabaseClient } from '@supabase/supabase-js';
import cardAccessManifest from '@/data/card-access-manifest.json';
import {
  getModuleSlug,
  getModuleUrlForSlug,
  isWorkerTokenGatedHost,
} from '@/utils/applicationHealthCheck';
import { getModuleAppUrl } from '@/utils/moduleAppUrl';

type CardAccessManifestEntry = {
  slug: string;
  hasAccessButton: boolean;
  hasCardPage: boolean;
};

const manifestEntries = (cardAccessManifest.entries || []) as CardAccessManifestEntry[];
const manifestSlugs = new Set(manifestEntries.map((e) => e.slug));
const manifestAccessBySlug = new Map(
  manifestEntries.map((e) => [e.slug, e.hasAccessButton] as const)
);

const ACCESS_SOURCE_PATTERNS = [
  /CardPageAccessSection/,
  /CardPageActivationSection/,
  /ModuleAccessButton/,
  /EssentialAccessButton/,
  /openModuleAppWithToken/,
  /generate-access-token/,
];

export type CardAccessCheckRow = {
  module_id: string;
  module_name: string;
  card_slug: string;
  card_page_url: string;
  expected_app_url: string | null;
  isValid: boolean;
  isSkipped?: boolean;
  issues: string[];
  checks: {
    cardPageExists: boolean;
    hasAccessButtonInSource: boolean;
    appUrlConfigured: boolean;
    appUrlNotRedirectingToCard: boolean;
  };
  responseTimeMs?: number;
};

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://iahome.fr').replace(/\/$/, '');
}

function listCardSlugsFromDisk(): Set<string> {
  const cardDir = path.join(process.cwd(), 'src', 'app', 'card');
  if (fs.existsSync(cardDir)) {
    return new Set(
      fs
        .readdirSync(cardDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name !== '[id]')
        .map((d) => d.name)
    );
  }

  // Prod Docker : src/ absent, manifest généré au build
  return manifestSlugs;
}

function cardHasAccessButtonInSource(cardSlug: string): boolean {
  const interactivePath = path.join(process.cwd(), 'src', 'app', 'card', cardSlug, 'CardInteractive.tsx');
  const pagePath = path.join(process.cwd(), 'src', 'app', 'card', cardSlug, 'page.tsx');

  let content = '';
  if (fs.existsSync(interactivePath)) {
    content += fs.readFileSync(interactivePath, 'utf8');
  }
  if (fs.existsSync(pagePath)) {
    content += fs.readFileSync(pagePath, 'utf8');
  }

  if (content) {
    return ACCESS_SOURCE_PATTERNS.some((pattern) => pattern.test(content));
  }

  return manifestAccessBySlug.get(cardSlug) ?? false;
}

function resolveAbsoluteAppUrl(appUrl: string, baseUrl: string): string {
  if (appUrl.startsWith('/')) {
    return `${baseUrl}${appUrl}`;
  }
  return appUrl;
}

/** Sous-domaines *.iahome.fr protégés par le worker (hors landings publiques). */
function isTokenGatedSubdomainAppUrl(appUrl: string, baseUrl: string): boolean {
  const absolute = resolveAbsoluteAppUrl(appUrl, baseUrl);
  try {
    return isWorkerTokenGatedHost(new URL(absolute).hostname);
  } catch {
    return false;
  }
}

async function fetchStatus(url: string, method: 'HEAD' | 'GET' = 'HEAD'): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IAHome-CardAccess-Checker/1.0)' },
    });
    clearTimeout(timeoutId);
    return response.status;
  } catch {
    return null;
  }
}

async function fetchRedirectLocation(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IAHome-CardAccess-Checker/1.0)' },
    });
    clearTimeout(timeoutId);
    if (![301, 302, 307, 308].includes(response.status)) {
      return null;
    }
    return response.headers.get('location');
  } catch {
    return null;
  }
}

async function checkAppUrlNotRedirectingToCard(
  appUrl: string,
  cardSlug: string,
  baseUrl: string
): Promise<{ ok: boolean; issue?: string }> {
  const absolute = resolveAbsoluteAppUrl(appUrl, baseUrl);
  const gated = isTokenGatedSubdomainAppUrl(appUrl, baseUrl);

  // Worker : sans token, un sous-domaine protégé doit renvoyer 302 direct_access_denied
  if (gated) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(absolute, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; IAHome-CardAccess-Checker/1.0)',
          Accept: 'text/html',
        },
      });
      clearTimeout(timeoutId);
      const location = response.headers.get('location') || '';
      const denied =
        [301, 302, 303, 307, 308].includes(response.status) &&
        location.includes('direct_access_denied');
      if (denied) {
        return { ok: true };
      }
      if (response.status >= 200 && response.status < 400) {
        return {
          ok: false,
          issue:
            'Sous-domaine accessible sans token (worker protect attendu: 302 direct_access_denied)',
        };
      }
      return {
        ok: false,
        issue: `Gate worker inattendue (HTTP ${response.status}${location ? ` → ${location}` : ''})`,
      };
    } catch {
      return { ok: false, issue: 'Sous-domaine protégé injoignable (timeout / réseau)' };
    }
  }

  const location = await fetchRedirectLocation(absolute);

  if (!location) {
    return { ok: true };
  }

  let normalized = location;
  try {
    normalized = new URL(location, absolute).pathname;
  } catch {
    // keep raw location
  }

  const cardPath = `/card/${cardSlug}`;
  if (normalized.includes(cardPath) || location.includes(cardPath)) {
    return {
      ok: false,
      issue: `L'URL applicative redirige vers la fiche produit (${location}) au lieu de l'app`,
    };
  }

  return { ok: true };
}

export async function checkCardAccessForModule(params: {
  moduleId: string;
  moduleName: string;
  cardSlug: string;
  baseUrl?: string;
}): Promise<CardAccessCheckRow> {
  const start = Date.now();
  const baseUrl = params.baseUrl || getBaseUrl();
  const { moduleId, moduleName, cardSlug } = params;
  const issues: string[] = [];

  const cardPageUrl = `${baseUrl}/card/${cardSlug}`;
  const cardStatus = await fetchStatus(cardPageUrl, 'GET');
  const cardPageExists = cardStatus !== null && cardStatus >= 200 && cardStatus < 400;

  if (!cardPageExists) {
    issues.push(
      cardStatus === null
        ? 'Fiche produit injoignable (timeout ou erreur réseau)'
        : `Fiche produit HTTP ${cardStatus}`
    );
  }

  const hasAccessButtonInSource = cardHasAccessButtonInSource(cardSlug);
  if (!hasAccessButtonInSource) {
    issues.push(
      'Aucun composant d\'accès détecté dans le code (CardPageAccessSection / ModuleAccessButton / generate-access-token)'
    );
  }

  const expectedAppUrl = getModuleAppUrl(moduleId) || getModuleUrlForSlug(moduleId, moduleName) || null;
  const appUrlConfigured = Boolean(expectedAppUrl);
  if (!appUrlConfigured) {
    issues.push('URL applicative non configurée (getModuleAppUrl)');
  }

  let appUrlNotRedirectingToCard = true;
  if (expectedAppUrl) {
    const redirectCheck = await checkAppUrlNotRedirectingToCard(expectedAppUrl, cardSlug, baseUrl);
    appUrlNotRedirectingToCard = redirectCheck.ok;
    if (!redirectCheck.ok && redirectCheck.issue) {
      issues.push(redirectCheck.issue);
    }
  } else {
    appUrlNotRedirectingToCard = false;
  }

  const isValid =
    cardPageExists && hasAccessButtonInSource && appUrlConfigured && appUrlNotRedirectingToCard;

  return {
    module_id: moduleId,
    module_name: moduleName,
    card_slug: cardSlug,
    card_page_url: cardPageUrl,
    expected_app_url: expectedAppUrl,
    isValid,
    issues,
    checks: {
      cardPageExists,
      hasAccessButtonInSource,
      appUrlConfigured,
      appUrlNotRedirectingToCard,
    },
    responseTimeMs: Date.now() - start,
  };
}

export async function runAllCardAccessChecks(
  supabase: SupabaseClient,
  options?: { baseUrl?: string }
): Promise<CardAccessCheckRow[]> {
  const cardSlugs = listCardSlugsFromDisk();
  const baseUrl = options?.baseUrl || getBaseUrl();

  const { data: modulesData, error } = await supabase
    .from('modules')
    .select('id, title')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const seenSlugs = new Set<string>();
  const results: CardAccessCheckRow[] = [];

  for (const mod of modulesData || []) {
    const slug = getModuleSlug(mod.id, mod.title || mod.id);
    if (!cardSlugs.has(slug) || seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);

    results.push(
      await checkCardAccessForModule({
        moduleId: mod.id,
        moduleName: mod.title || mod.id,
        cardSlug: slug,
        baseUrl,
      })
    );
  }

  // Fiches présentes sur disque mais absentes de Supabase
  for (const slug of cardSlugs) {
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    results.push(
      await checkCardAccessForModule({
        moduleId: slug,
        moduleName: slug,
        cardSlug: slug,
        baseUrl,
      })
    );
  }

  return results.sort((a, b) => a.card_slug.localeCompare(b.card_slug, 'fr'));
}
