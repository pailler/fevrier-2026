import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const ALERT_EMAIL = process.env.MONITOR_ALERT_EMAIL || process.env.RESEND_ALERT_EMAIL || 'formateur_tic@hotmail.com';
const MONITOR_URL = 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    // Vérifier si localhost:3000 répond
    let isOnline = false;
    let errorMessage = '';

    try {
      const response = await fetch(MONITOR_URL, {
        method: 'GET',
        headers: {
          'User-Agent': 'IAHome-Monitor/1.0'
        },
        signal: AbortSignal.timeout(5000) // Timeout de 5 secondes
      });

      if (response.status === 200 || response.status < 500) {
        isOnline = true;
      }
    } catch (error) {
      isOnline = false;
      errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    }

    // Si le serveur est hors ligne, envoyer une alerte
    if (!isOnline) {
      await sendAlertEmail(errorMessage);
    }

    return NextResponse.json({
      success: true,
      isOnline,
      url: MONITOR_URL,
      timestamp: new Date().toISOString(),
      error: errorMessage || null
    });

  } catch (error) {
    console.error('❌ Erreur lors du monitoring:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

async function sendAlertEmail(errorMessage: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY non configuré');
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@iahome.fr';

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
        <h2>🚨 ALERTE: Serveur localhost:3000 hors ligne</h2>
        
        <div class="alert">
          <strong>Le serveur Next.js sur localhost:3000 ne répond plus.</strong>
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
            <li>Vérifier les logs du serveur</li>
            <li>Redémarrer l'application si nécessaire</li>
            <li>Vérifier l'utilisation des ressources (CPU, mémoire)</li>
          </ul>
        </div>

        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          Cette alerte a été générée automatiquement par le système de monitoring IAHome.
        </p>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: fromEmail,
      to: ALERT_EMAIL,
      subject,
      html
    });

    if (result.error) {
      console.error('❌ Erreur lors de l\'envoi de l\'alerte:', result.error);
    } else {
      console.log('✅ Alerte envoyée à', ALERT_EMAIL);
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email d\'alerte:', error);
  }
}


