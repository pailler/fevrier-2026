#!/usr/bin/env node
/**
 * Script de monitoring localhost:3000 - envoie une notification Resend quand le serveur est down.
 * S'exécute indépendamment de Next.js : même si l'app crash, ce script peut toujours envoyer l'alerte.
 *
 * Usage:
 *   npm run monitor          # Surveillance continue (vérification toutes les 2 min)
 *   npm run monitor:check    # Vérification unique
 *
 * Variables d'environnement requises (.env.local ou .env) :
 *   RESEND_API_KEY          - Clé API Resend
 *   MONITOR_ALERT_EMAIL     - Email pour recevoir les alertes (optionnel, fallback: RESEND_ALERT_EMAIL)
 *   RESEND_FROM_EMAIL       - Email expéditeur (optionnel)
 *   MONITOR_URL             - URL à surveiller (défaut: http://localhost:3000)
 *   MONITOR_INTERVAL_MS     - Intervalle entre les vérifications en ms (défaut: 120000 = 2 min)
 */

const path = require('path');
const fs = require('fs');

// Charger les variables d'environnement
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  const projectRoot = path.resolve(__dirname, '..');

  for (const file of envFiles) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) process.env[key] = value;
        }
      }
      console.log(`📂 Config chargée depuis ${file}`);
      break;
    }
  }
}

loadEnv();

const MONITOR_URL = process.env.MONITOR_URL || 'http://localhost:3000';
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

    if (response.status === 200 || response.status < 500) {
      isOnline = true;
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

  const subject = '🚨 ALERTE: localhost:3000 est hors ligne';
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
      <li>Vérifier les logs du serveur (npm run dev)</li>
      <li>Redémarrer l'application: npm run dev</li>
      <li>Vérifier l'utilisation des ressources (CPU, mémoire)</li>
    </ul>
  </div>

  <p style="margin-top: 20px; color: #666; font-size: 12px;">
    Cette alerte a été générée par le script de monitoring IAHome (scripts/monitor-localhost.js).
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
