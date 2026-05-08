#!/usr/bin/env node
/**
 * Script de monitoring localhost:3000 — notification Resend (formateur_tic@hotmail.com par défaut) si l’app ne répond pas.
 * S’exécute hors Next.js : une alerte peut partir même si le serveur Next est arrêté.
 *
 * Usage:
 *   npm run monitor              # Surveillance continue (toutes les 2 min, cooldown 30 min entre mails)
 *   npm run monitor:check        # Une vérification puis exit (adapté Tâche planifiée Windows, 2×/jour)
 *   npm run monitor:schedule-install  # Enregistre la tâche Windows (08:00 et 20:00)
 *
 * Variables (.env, .env.local, .env.production.local — chargés dans cet ordre, dernier gagne) :
 *   RESEND_API_KEY           - Obligatoire pour l’envoi
 *   MONITOR_ALERT_EMAIL      - Destinataire (défaut: formateur_tic@hotmail.com)
 *   RESEND_FROM_EMAIL        - Expéditeur vérifié chez Resend
 *   MONITOR_URL              - URL de test (défaut: http://localhost:3000/api/version)
 *   MONITOR_INTERVAL_MS      - Mode continu uniquement (défaut: 120000)
 */

const path = require('path');
const fs = require('fs');

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const eq = trimmed.indexOf('=');
  if (eq <= 0) return null;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

/** Charge .env puis .env.local puis .env.production.local (comme Next), dernier fichier gagne. */
function loadEnv() {
  const envFiles = ['.env', '.env.local', '.env.production.local'];
  const projectRoot = path.resolve(__dirname, '..');

  for (const file of envFiles) {
    const filePath = path.join(projectRoot, file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const parsed = parseEnvLine(line);
      if (parsed) process.env[parsed.key] = parsed.value;
    }
    console.log(`📂 Config fusionnée: ${file}`);
  }
}

loadEnv();

const MONITOR_URL =
  process.env.MONITOR_URL || 'http://localhost:3000/api/version';
const MONITOR_INTERVAL_MS = parseInt(process.env.MONITOR_INTERVAL_MS || '120000', 10);
const ALERT_EMAIL =
  process.env.MONITOR_ALERT_EMAIL || process.env.RESEND_ALERT_EMAIL || 'formateur_tic@hotmail.com';

async function checkLocalhost() {
  let isOnline = false;
  let errorMessage = '';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(MONITOR_URL, {
      method: 'GET',
      headers: { 'User-Agent': 'IAHome-Monitor/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      isOnline = true;
    } else {
      errorMessage = `HTTP ${response.status} ${response.statusText || ''}`.trim();
    }
  } catch (error) {
    isOnline = false;
    errorMessage = error?.message || 'Le serveur ne répond pas';
  }

  return { isOnline, errorMessage };
}

async function sendAlertEmail(errorMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY non configuré - impossible d\'envoyer l\'alerte');
    return false;
  }

  const { Resend } = require('resend');
  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'IAHome <noreply@iahome.fr>';

  const scheduled =
    process.argv.includes('--once') || process.argv.includes('-o');
  const subject = scheduled
    ? '🚨 IAHome — localhost:3000 indisponible (contrôle planifié)'
    : '🚨 ALERTE: localhost:3000 est hors ligne';
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
  <h2>🚨 ALERTE: Serveur localhost hors ligne</h2>

  <div class="alert">
    <strong>Le serveur IAHome sur ${MONITOR_URL} ne répond plus.</strong>
  </div>

  <div class="info">
    <h3>Détails de l'alerte:</h3>
    <div class="details">
      <p><strong>URL surveillée:</strong> ${MONITOR_URL}</p>
      <p><strong>Date et heure:</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</p>
      <p><strong>Erreur:</strong> ${errorMessage || 'Le serveur ne répond pas'}</p>
    </div>
  </div>

  <div class="info">
    <h3>Actions recommandées:</h3>
    <ul>
      <li>Vérifier si le processus Node.js est en cours d'exécution</li>
      <li>Vérifier les logs du serveur (npm run dev ou npm run start)</li>
      <li>Redémarrer : <code>npm run dev</code> (dev) ou <code>npm run start</code> (prod après build)</li>
      <li>Vérifier l'utilisation des ressources (CPU, mémoire)</li>
    </ul>
  </div>

  <p style="margin-top: 20px; color: #666; font-size: 12px;">
    Alerte générée par scripts/monitor-localhost.js${scheduled ? ' (exécution planifiée 2×/jour).' : '.'}
  </p>
</body>
</html>
`;

  try {
    const result = await resend.emails.send({
      from: fromEmail.includes('<') ? fromEmail : `IAHome <${fromEmail}>`,
      to: ALERT_EMAIL,
      subject,
      html,
    });

    if (result.error) {
      console.error('❌ Erreur Resend:', result.error);
      return false;
    }
    console.log('✅ Alerte envoyée à', ALERT_EMAIL);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error?.message);
    return false;
  }
}

// Éviter les alertes en rafale : cooldown de 30 min entre deux emails
let lastAlertSentAt = null;
const ALERT_COOLDOWN_MS = 30 * 60 * 1000;

async function runCheck() {
  const { isOnline, errorMessage } = await checkLocalhost();
  const now = new Date().toISOString();

  if (isOnline) {
    console.log(`[${now}] ✅ ${MONITOR_URL} — en ligne`);
    return;
  }

  console.log(`[${now}] ❌ ${MONITOR_URL} — hors ligne:`, errorMessage);

  const canSendAlert =
    !lastAlertSentAt || Date.now() - lastAlertSentAt > ALERT_COOLDOWN_MS;

  if (canSendAlert) {
    await sendAlertEmail(errorMessage);
    lastAlertSentAt = Date.now();
  } else {
    console.log('⏳ Alerte déjà envoyée récemment, cooldown actif (30 min)');
  }
}

async function main() {
  const singleCheck = process.argv.includes('--once') || process.argv.includes('-o');

  console.log('🔍 Monitoring IAHome - localhost');
  console.log('   URL:', MONITOR_URL);
  console.log('   Email alerte:', ALERT_EMAIL);
  if (!singleCheck) {
    console.log('   Intervalle:', MONITOR_INTERVAL_MS / 1000, 'secondes');
  }
  console.log('');

  if (singleCheck) {
    await runCheck();
    process.exit(0);
    return;
  }

  // Boucle continue
  await runCheck();
  setInterval(runCheck, MONITOR_INTERVAL_MS);
  console.log('📡 Surveillance active - Ctrl+C pour arrêter\n');
}

main().catch((err) => {
  console.error('Erreur:', err);
  process.exit(1);
});
