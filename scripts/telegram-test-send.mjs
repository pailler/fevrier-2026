/**
 * Envoie un message de test sur Telegram.
 *
 *   TELEGRAM_BOT_TOKEN=... TELEGRAM_ADMIN_CHAT_IDS=123 npx --yes node scripts/telegram-test-send.mjs
 *
 * Si TELEGRAM_ADMIN_CHAT_IDS est absent, le script tente d’utiliser
 * les chat_id vus via getUpdates (il faut avoir ouvert le bot et appuyé sur Démarrer).
 */
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });
config({ path: join(__dirname, '..', '.env') });

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const fromEnv = process.env.TELEGRAM_ADMIN_CHAT_IDS?.split(/[,\n\r;]+/)
  .map((s) => s.trim())
  .filter(Boolean);

async function main() {
  if (!token) {
    console.error('Définir TELEGRAM_BOT_TOKEN (Vercel / .env.local).');
    process.exit(1);
  }
  const base = `https://api.telegram.org/bot${token}`;

  let chatIds = [...(fromEnv || [])];

  if (chatIds.length === 0) {
    const r = await fetch(`${base}/getUpdates`);
    const j = await r.json();
    if (!j.ok) {
      console.error('getUpdates', j);
      process.exit(1);
    }
    const seen = new Set();
    for (const u of j.result || []) {
      const id =
        u.message?.chat?.id ??
        u.edited_message?.chat?.id ??
        u.channel_post?.chat?.id ??
        u.callback_query?.message?.chat?.id;
      if (id != null) seen.add(String(id));
    }
    chatIds = [...seen];
    if (chatIds.length) {
      console.log('Chat IDs (getUpdates) :', chatIds.join(', '));
    }
  }

  if (chatIds.length === 0) {
    console.error(
      "Aucun chat_id. Ouvrez https://t.me/Iahome_notifs_bot puis « Démarrer », ou définissez TELEGRAM_ADMIN_CHAT_IDS (ex. votre ID @userinfobot), puis relancez."
    );
    process.exit(1);
  }

  const text = `Test IAHome · ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`;
  for (const chatId of chatIds) {
    const res = await fetch(`${base}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const j = await res.json();
    if (!j.ok) {
      console.error('Échec', chatId, j);
      process.exitCode = 1;
    } else {
      console.log('Message envoyé → chat', chatId);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
