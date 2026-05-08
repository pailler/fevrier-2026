#!/usr/bin/env node
/**
 * Envoie un e-mail de test identique au style « alerte monitoring » (Resend).
 * Usage : npm run test:monitor-email
 * Variables : RESEND_API_KEY, RESEND_FROM_EMAIL, MONITOR_ALERT_EMAIL (défaut formateur_tic@hotmail.com)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function parseEnvLine(line) {
  const t = line.trim();
  if (!t || t.startsWith('#')) return null;
  const eq = t.indexOf('=');
  if (eq <= 0) return null;
  const key = t.slice(0, eq).trim();
  let value = t.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

function loadEnv() {
  for (const file of ['.env', '.env.local', '.env.production.local']) {
    const fp = path.join(projectRoot, file);
    if (!fs.existsSync(fp)) continue;
    const content = fs.readFileSync(fp, 'utf8');
    for (const line of content.split('\n')) {
      const p = parseEnvLine(line);
      if (p) process.env[p.key] = p.value;
    }
    console.log('Config:', file);
  }
}

loadEnv();

const apiKey = process.env.RESEND_API_KEY;
const to =
  process.env.MONITOR_ALERT_EMAIL ||
  process.env.RESEND_ALERT_EMAIL ||
  'formateur_tic@hotmail.com';
const rawFrom = process.env.RESEND_FROM_EMAIL || 'noreply@iahome.fr';
const from = rawFrom.includes('<') ? rawFrom : `IAHome <${rawFrom}>`;

if (!apiKey) {
  console.error('RESEND_API_KEY manquant dans .env.local');
  process.exit(1);
}

const resend = new Resend(apiKey);
const subject = '[TEST] IAHome — notification monitoring (simulation)';
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:system-ui,sans-serif;padding:20px;">
<p><strong>Test d’envoi</strong></p>
<p>Ceci simule l’alerte envoyée lorsque <code>localhost:3000</code> ne répond pas (contrôle planifié ou <code>npm run monitor:check</code>).</p>
<p>Destinataire : ${to}</p>
<p style="color:#666;font-size:12px;">${new Date().toISOString()}</p>
</body></html>`;

const { data, error } = await resend.emails.send({ from, to, subject, html });

if (error) {
  console.error('Resend:', error);
  process.exit(1);
}

console.log('OK — e-mail de test envoyé, id Resend:', data?.id);
