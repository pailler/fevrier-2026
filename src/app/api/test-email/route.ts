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
      case 'user_created':
        result = await notificationService.notifyUserCreated(email, 'Utilisateur Test');
        break;
      case 'user_login':
        result = await notificationService.notifyUserLogin(email, 'Utilisateur Test');
        break;
      case 'module_activated':
        result = await notificationService.notifyModuleActivated(email, 'Module Test', 'Utilisateur Test');
        break;
      case 'app_accessed':
        result = await notificationService.notifyAppAccessed(email, 'Application Test', 'Utilisateur Test');
        break;
      default:
        result = await notificationService.sendNotification(eventType, email, {
          userName: 'Utilisateur Test',
          moduleName: 'Module Test',
          appName: 'Application Test',
          timestamp: new Date().toISOString()
        });
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
