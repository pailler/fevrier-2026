import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { runAllModulesHealthCheck } from '@/utils/applicationHealthCheck';
import { getIahomeHealthPingUrl, getIahomeMonitorBaseUrl } from '@/utils/iahomeMonitorUrl';
import { sendMonitorResendEmail } from '@/utils/monitorResendAlerts';

function cronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }
  const bearer = request.headers.get('authorization');
  if (bearer === `Bearer ${secret}`) return true;
  const q = request.nextUrl.searchParams.get('secret');
  return q === secret;
}

async function pingSite(): Promise<{ ok: boolean; errorMessage?: string; pingUrl: string }> {
  const pingUrl = getIahomeHealthPingUrl();
  try {
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'IAHome-Cron-Health/1.0' },
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    });
    if (response.ok) {
      return { ok: true, pingUrl };
    }
    return {
      ok: false,
      pingUrl,
      errorMessage: `HTTP ${response.status}`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur inconnue';
    return { ok: false, pingUrl, errorMessage: msg };
  }
}

/**
 * Cron / surveillance : vérifie le site + les applis, envoie un email Resend si
 * le site ne répond pas OU si plus de 2 applications ont échoué au healthcheck HTTP.
 *
 * Auth : header `Authorization: Bearer ${CRON_SECRET}` ou `?secret=` (même valeur).
 * Sans CRON_SECRET en dev, l’appel est autorisé (pratique pour tester en local).
 */
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const ping = await pingSite();
  const supabase = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());
  let moduleResults: Awaited<ReturnType<typeof runAllModulesHealthCheck>> = [];
  let modulesError: string | null = null;

  try {
    moduleResults = await runAllModulesHealthCheck(supabase);
  } catch (e) {
    modulesError = e instanceof Error ? e.message : 'Erreur modules';
  }

  const httpFailures = moduleResults.filter((r) => r.url !== null && !r.isValid);
  const shouldAlertApps = httpFailures.length > 2;
  const shouldAlertSite = !ping.ok;

  if (!shouldAlertSite && !shouldAlertApps) {
    return NextResponse.json({
      success: true,
      alerted: false,
      siteOk: ping.ok,
      pingUrl: ping.pingUrl,
      baseUrl: getIahomeMonitorBaseUrl(),
      appsChecked: moduleResults.length,
      httpFailureCount: httpFailures.length,
      modulesError,
    });
  }

  const rows = httpFailures
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.module_name)}</td><td>${escapeHtml(r.url || '')}</td><td>${escapeHtml(r.errorMessage || '—')}</td></tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; line-height: 1.5; color: #333; }
  .alert { background: #fee; border-left: 4px solid #c00; padding: 12px 16px; margin: 16px 0; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 14px; }
  th { background: #f0f0f0; }
</style>
</head><body>
  <h2>IAHome — alerte monitoring</h2>
  ${
    shouldAlertSite
      ? `<div class="alert"><strong>Site / endpoint santé : problème</strong><br>
         URL testée : <code>${escapeHtml(ping.pingUrl)}</code><br>
         Détail : ${escapeHtml(ping.errorMessage || 'pas de réponse')}</div>`
      : `<p><strong>Site :</strong> OK (${escapeHtml(ping.pingUrl)})</p>`
  }
  ${
    shouldAlertApps
      ? `<div class="alert"><strong>Applications en erreur : ${httpFailures.length}</strong> (seuil d’alerte : plus de 2)</div>
         <table><thead><tr><th>Module</th><th>URL</th><th>Erreur</th></tr></thead><tbody>${rows}</tbody></table>`
      : `<p><strong>Applications HTTP en échec :</strong> ${httpFailures.length} (seuil : &gt; 2)</p>`
  }
  ${modulesError ? `<p style="color:#b00"><strong>Erreur lecture modules :</strong> ${escapeHtml(modulesError)}</p>` : ''}
  <p style="color:#666;font-size:12px;margin-top:24px">Généré par /api/cron/health-alerts — ${new Date().toISOString()}</p>
</body></html>`;

  const subjectParts: string[] = [];
  if (shouldAlertSite) subjectParts.push('site indisponible');
  if (shouldAlertApps) subjectParts.push(`${httpFailures.length} applis en erreur`);
  const subject = `🚨 IAHome — ${subjectParts.join(' · ')}`;

  const sendResult = await sendMonitorResendEmail({ subject, html });

  return NextResponse.json({
    success: sendResult.ok,
    alerted: true,
    siteOk: ping.ok,
    pingUrl: ping.pingUrl,
    baseUrl: getIahomeMonitorBaseUrl(),
    appsChecked: moduleResults.length,
    httpFailureCount: httpFailures.length,
    modulesError,
    emailError: sendResult.ok === false ? sendResult.error : null,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
