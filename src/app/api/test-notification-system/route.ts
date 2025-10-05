import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/utils/notificationService';

export async function POST(request: NextRequest) {
  try {
    const { email, testType } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    console.log(`🧪 Test de notification: ${testType} pour ${email}`);

    let success = false;
    let message = '';

    switch (testType) {
      case 'signup':
        success = await notificationService.sendUserSignupNotification(email, 'Utilisateur Test');
        message = success ? 'Notification d\'inscription envoyée' : 'Erreur lors de l\'envoi de la notification d\'inscription';
        break;

      case 'login':
        success = await notificationService.sendUserLoginNotification(email, 'Utilisateur Test');
        message = success ? 'Notification de connexion envoyée' : 'Erreur lors de l\'envoi de la notification de connexion';
        break;

      case 'module_activated':
        success = await notificationService.sendModuleActivatedNotification(email, 'Utilisateur Test', 'LibreSpeed');
        message = success ? 'Notification d\'activation de module envoyée' : 'Erreur lors de l\'envoi de la notification d\'activation';
        break;

      case 'payment_success':
        success = await notificationService.sendPaymentSuccessNotification(email, 'Utilisateur Test', '29.99€', 'LibreSpeed Premium');
        message = success ? 'Notification de paiement envoyée' : 'Erreur lors de l\'envoi de la notification de paiement';
        break;

      case 'usage_limit':
        success = await notificationService.sendUsageLimitNotification(email, 'Utilisateur Test', 'LibreSpeed', 20, 20);
        message = success ? 'Notification de limite d\'usage envoyée' : 'Erreur lors de l\'envoi de la notification de limite';
        break;

      case 'admin_alert':
        success = await notificationService.sendAdminAlert(email, 'Test système', 'Ceci est un test du système d\'alertes administrateur', 'medium');
        message = success ? 'Alerte administrateur envoyée' : 'Erreur lors de l\'envoi de l\'alerte administrateur';
        break;

      case 'test':
        success = await notificationService.sendTestEmail(email);
        message = success ? 'Email de test envoyé' : 'Erreur lors de l\'envoi de l\'email de test';
        break;

      default:
        return NextResponse.json(
          { error: 'Type de test non valide' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success,
      message,
      testType,
      email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur lors du test de notification:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de test du système de notifications',
    availableTests: [
      'signup - Test notification d\'inscription',
      'login - Test notification de connexion',
      'module_activated - Test notification d\'activation de module',
      'payment_success - Test notification de paiement',
      'usage_limit - Test notification de limite d\'usage',
      'admin_alert - Test alerte administrateur',
      'test - Test email simple'
    ],
    usage: 'POST avec { "email": "test@example.com", "testType": "signup" }'
  });
}
