import { Resend } from 'resend';
import { ADMIN_EMAILS } from '@/utils/adminEmails';

/** Format expéditeur attendu par Resend pour un domaine vérifié. */
export function formatResendMonitorFrom(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@iahome.fr';
  return raw.includes('<') ? raw : `IAHome <${raw}>`;
}

/** Destinataires des alertes monitoring (plusieurs séparés par , ou ;). */
export function getMonitorAlertRecipients(): string[] {
  const raw =
    process.env.MONITOR_ALERT_EMAIL?.trim() ||
    process.env.RESEND_ALERT_EMAIL?.trim() ||
    '';
  if (raw) {
    const list = raw
      .split(/[,;]/)
      .map((e) => e.trim())
      .filter(Boolean);
    if (list.length) return list;
  }
  return [...ADMIN_EMAILS];
}

export async function sendMonitorResendEmail(params: {
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY manquant' };
  }

  const to = getMonitorAlertRecipients();
  const resend = new Resend(apiKey);

  const result = await resend.emails.send({
    from: formatResendMonitorFrom(),
    to,
    subject: params.subject,
    html: params.html,
  });

  if (result.error) {
    console.error('❌ Resend (monitor):', result.error);
    return { ok: false, error: JSON.stringify(result.error) };
  }
  console.log('✅ Alerte monitoring envoyée à', to.join(', '));
  return { ok: true };
}
