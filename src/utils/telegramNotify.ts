/**
 * Notifications admin via Telegram (Bot API).
 *
 * Configuration (Vercel / .env local) — ne jamais commiter de secrets :
 *   TELEGRAM_BOT_TOKEN=...          (depuis @BotFather)
 *   TELEGRAM_ADMIN_CHAT_IDS=123,456  (IDs séparés par virgule ; obtenir l’ID : écrire au bot puis GET getUpdates, ou @userinfobot)
 *
 * Optionnel : TELEGRAM_NOTIFICATIONS=1   (désactivé si absent ; si vous préférez activer seulement avec ce flag, voir isTelegramNotificationsEnabled)
 */

const TELEGRAM_API = 'https://api.telegram.org';
const MAX_MESSAGE_LENGTH = 4000;

function getBotToken(): string | undefined {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || undefined;
}

function getChatIds(): string[] {
  const raw = process.env.TELEGRAM_ADMIN_CHAT_IDS?.trim();
  if (!raw) return [];
  return raw
    .split(/[,;\n\r]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Si false, rien n’est envoyé (pas de token / pas de chats). */
export function isTelegramNotificationsReady(): boolean {
  return !!(getBotToken() && getChatIds().length > 0);
}

/** Désactiver t’envoi sauf si TELEGRAM_NOTIFICATIONS est absent ou 1/true/yes. */
function isNotificationGloballyEnabled(): boolean {
  const v = process.env.TELEGRAM_NOTIFICATIONS?.trim().toLowerCase();
  if (!v) return true;
  return v === '1' || v === 'true' || v === 'yes';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function sendTelegramHtml(chatId: string, html: string): Promise<boolean> {
  const token = getBotToken();
  if (!token) return false;

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: html.slice(0, MAX_MESSAGE_LENGTH),
    parse_mode: 'HTML' as const,
    disable_web_page_preview: true,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[Telegram] sendMessage failed', res.status, err);
    return false;
  }
  return true;
}

/**
 * Envoie un message formaté à tous les chats admin (échecs ignorés, logués).
 */
export async function notifyTelegramAdmins(params: { title: string; lines: string[] }): Promise<void> {
  if (!isNotificationGloballyEnabled() || !isTelegramNotificationsReady()) {
    return;
  }

  const block = [
    `<b>${escapeHtml(params.title)}</b>`,
    ...params.lines.map((l) => escapeHtml(l)),
    `<i>IAHome · ${escapeHtml(new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }))}</i>`,
  ].join('\n');

  const chats = getChatIds();
  await Promise.all(
    chats.map(async (chatId) => {
      try {
        await sendTelegramHtml(chatId, block);
      } catch (e) {
        console.error('[Telegram] notify error for chat', chatId, e);
      }
    })
  );
}

export async function notifyTelegramNewUser(params: {
  userEmail: string;
  userName: string;
  source: 'email' | 'oauth' | 'alternative';
}): Promise<void> {
  const sourceLabel =
    params.source === 'oauth'
      ? 'OAuth (Google, etc.)'
      : params.source === 'alternative'
        ? 'Inscription alternative'
        : 'E-mail / mot de passe';
  await notifyTelegramAdmins({
    title: 'Nouvel utilisateur · IAHome',
    lines: [
      `Nom : ${params.userName}`,
      `Email : ${params.userEmail}`,
      `Source : ${sourceLabel}`,
    ],
  });
}

export async function notifyTelegramBlogArticlePublished(params: {
  title: string;
  slug: string;
  publicBaseUrl?: string;
}): Promise<void> {
  const base = (params.publicBaseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://iahome.fr').replace(
    /\/$/,
    ''
  );
  const url = `${base}/blog/${params.slug}`;
  await notifyTelegramAdmins({
    title: 'Article de blog publié',
    lines: [`Titre : ${params.title}`, `Lien : ${url}`],
  });
}

export type HealthRowLike = {
  module_name: string;
  url: string | null;
  isValid: boolean;
  isSkipped?: boolean;
  errorMessage?: string;
  statusCode?: number;
  isCloudflareError?: boolean;
};

export async function notifyTelegramAppHealthFailures(rows: HealthRowLike[]): Promise<void> {
  const bad = rows.filter((r) => !r.isValid && !r.isSkipped);
  if (bad.length === 0) return;

  const lines: string[] = [
    `Applications en échec : ${bad.length}`,
    ...bad.slice(0, 15).map((r) => {
      const cf = r.isCloudflareError ? ' (Cloudflare)' : '';
      const st = r.statusCode != null ? ` HTTP ${r.statusCode}` : '';
      return `• ${r.module_name}${cf}${st} — ${r.errorMessage || 'indisponible'}${r.url ? ` — ${r.url}` : ''}`;
    }),
  ];
  if (bad.length > 15) {
    lines.push(`… +${bad.length - 15} autre(s)`);
  }
  await notifyTelegramAdmins({ title: 'Santé des applications (admin)', lines });
}

export async function notifyTelegramStripePaymentReceived(params: {
  sessionId: string;
  customerEmail: string;
  amountCents: number | null;
  currency: string | null;
  moduleOrPackage: string;
  mode: string;
}): Promise<void> {
  const amt =
    params.amountCents != null
      ? `${(params.amountCents / 100).toFixed(2)} ${(params.currency || 'eur').toUpperCase()}`
      : '—';
  await notifyTelegramAdmins({
    title: 'Paiement Stripe reçu',
    lines: [
      `Client : ${params.customerEmail}`,
      `Montant : ${amt}`,
      `Module / offre : ${params.moduleOrPackage}`,
      `Mode : ${params.mode}`,
      `Session : ${params.sessionId}`,
    ],
  });
}

export async function notifyTelegramStripePaymentFailed(params: {
  userEmail: string | null;
  reason?: string;
  invoiceId?: string;
}): Promise<void> {
  await notifyTelegramAdmins({
    title: 'Échec paiement (Stripe)',
    lines: [
      `Email : ${params.userEmail || '—'}`,
      `Facture : ${params.invoiceId || '—'}`,
      `Détail : ${params.reason || 'voir dashboard Stripe'}`,
    ],
  });
}
