/**
 * URL publique du site pour les healthchecks / alertes (évite localhost sur Vercel).
 * Priorité : MONITOR_SITE_URL → NEXT_PUBLIC_* → VERCEL_URL → fallback local.
 */
export function getIahomeMonitorBaseUrl(): string {
  const raw =
    process.env.MONITOR_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.APP_BASE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');

  if (!raw) {
    return 'http://127.0.0.1:3000';
  }
  return raw.replace(/\/$/, '');
}

/** URL complète pour le ping « site vivant » (léger, sans auth lourde). */
export function getIahomeHealthPingUrl(): string {
  const base = getIahomeMonitorBaseUrl();
  const custom = process.env.MONITOR_URL?.trim();
  if (custom) {
    return custom.replace(/\/$/, '');
  }
  return `${base}/api/health`;
}
