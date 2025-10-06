import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../utils/notificationService';

export async function POST(request: NextRequest) {
  try {
    const { email, eventType = 'user_created' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    const notificationService = NotificationService.getInstance();
    
    // Test avec différents types d'événements
    let result = false;
    
    switch (eventType) {
      case 'user_signup':
        result = await notificationService.sendUserSignupNotification(email, 'Utilisateur Test');
        break;
      case 'user_login':
        result = await notificationService.sendUserLoginNotification(email, 'Utilisateur Test');
        break;
      case 'module_activated':
        result = await notificationService.sendModuleActivatedNotification(email, 'Utilisateur Test', 'Module Test');
        break;
      case 'payment_success':
        result = await notificationService.sendPaymentSuccessNotification(email, 'Utilisateur Test', '29.99€', 'Module Test');
        break;
      case 'usage_limit':
        result = await notificationService.sendUsageLimitNotification(email, 'Utilisateur Test', 'Module Test', 20, 20);
        break;
      case 'admin_alert':
        result = await notificationService.sendAdminAlert(email, 'Test système', 'Ceci est un test', 'medium');
        break;
      default:
        result = await notificationService.sendTestEmail(email);
    }

    return NextResponse.json({
      success: result,
      message: result ? 'Email envoyé avec succès' : 'Erreur lors de l\'envoi de l\'email',
      eventType,
      email
    });

  } catch (error) {
    console.error('Erreur lors du test email:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
