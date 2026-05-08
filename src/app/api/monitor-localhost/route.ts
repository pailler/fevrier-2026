import { NextRequest, NextResponse } from 'next/server';
import { getIahomeHealthPingUrl, getIahomeMonitorBaseUrl } from '@/utils/iahomeMonitorUrl';
import { sendMonitorResendEmail } from '@/utils/monitorResendAlerts';

function canSendDownAlert(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  const bearer = request.headers.get('authorization');
  if (bearer === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get('secret') === secret;
}

/**
 * GET : vérifie que l’app répond (URL = MONITOR_URL ou &lt;base&gt;/api/health).
 * Si le site est hors ligne et l’auth cron est OK (ou CRON_SECRET non défini), envoie une alerte Resend.
 */
export async function GET(request: NextRequest) {
  try {
    const pingUrl = getIahomeHealthPingUrl();
    let isOnline = false;
    let errorMessage = '';

    try {
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'IAHome-Monitor/1.0' },
        signal: AbortSignal.timeout(10000),
        cache: 'no-store',
      });
      if (response.ok) {
        isOnline = true;
      } else {
        errorMessage = `HTTP ${response.status}`;
      }
    } catch (error) {
      isOnline = false;
      errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    }

    let alertSent = false;
    let alertSkippedReason: string | null = null;

    if (!isOnline) {
      if (canSendDownAlert(request)) {
        const base = getIahomeMonitorBaseUrl();
        const subject = `🚨 IAHome — site indisponible (${base})`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .alert { background-color: #fee; border-left: 4px solid #f00; padding: 15px; margin: 20px 0; }
          .info { background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
          .details { background-color: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0; }
          h2 { color: #d32f2f; }
        </style>
      </head>
      <body>
        <h2>IAHome — le site ne répond pas correctement</h2>
        <div class="alert">
          <strong>L’endpoint de surveillance ne répond pas (OK attendu).</strong>
        </div>
        <div class="info">
          <h3>Détails</h3>
          <div class="details">
            <p><strong>URL testée :</strong> ${pingUrl}</p>
            <p><strong>Base configurée :</strong> ${base}</p>
            <p><strong>Heure (UTC) :</strong> ${new Date().toISOString()}</p>
            <p><strong>Erreur :</strong> ${errorMessage || 'Pas de réponse'}</p>
          </div>
        </div>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          Définissez MONITOR_SITE_URL ou NEXT_PUBLIC_SITE_URL en production pour cibler https://iahome.fr.
          Avec CRON_SECRET défini, passez <code>Authorization: Bearer …</code> ou <code>?secret=</code> pour autoriser l’envoi mail.
        </p>
      </body>
      </html>
    `;
        const r = await sendMonitorResendEmail({ subject, html });
        alertSent = r.ok;
        if (!r.ok) alertSkippedReason = 'error' in r ? r.error : 'envoi refusé';
      } else {
        alertSkippedReason = 'auth: définissez Authorization Bearer CRON_SECRET ou ?secret=';
      }
    }

    return NextResponse.json({
      success: true,
      isOnline,
      pingUrl,
      baseUrl: getIahomeMonitorBaseUrl(),
      timestamp: new Date().toISOString(),
      error: errorMessage || null,
      alertSent,
      alertSkippedReason,
    });
  } catch (error) {
    console.error('❌ Erreur lors du monitoring:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
