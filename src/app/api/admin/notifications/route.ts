import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../../utils/notificationService';

export async function GET() {
  try {
    const notificationService = NotificationService.getInstance();
    const settings = await notificationService.getNotificationSettings();
    const logs = await notificationService.getNotificationLogs(20);

    return NextResponse.json({
      success: true,
      settings,
      logs
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, eventType, enabled } = await request.json();

    const notificationService = NotificationService.getInstance();

    switch (action) {
      case 'toggle':
        if (!eventType) {
          return NextResponse.json(
            { error: 'eventType requis' },
            { status: 400 }
          );
        }

        const success = await notificationService.updateNotificationSetting(eventType, {
          is_enabled: enabled
        });

        if (success) {
          // Récupérer les paramètres mis à jour
          const settings = await notificationService.getNotificationSettings();
          return NextResponse.json({
            success: true,
            message: `Notification ${enabled ? 'activée' : 'désactivée'} avec succès`,
            settings
          });
        } else {
          return NextResponse.json(
            { error: 'Erreur lors de la mise à jour' },
            { status: 500 }
          );
        }

      case 'test':
        const { email, eventType: testEventType } = await request.json();
        
        if (!email) {
          return NextResponse.json(
            { error: 'Email requis pour le test' },
            { status: 400 }
          );
        }

        let result = false;
        switch (testEventType) {
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
            result = await notificationService.sendNotification(testEventType, email, {
              userName: 'Utilisateur Test',
              moduleName: 'Module Test',
              appName: 'Application Test',
              timestamp: new Date().toISOString()
            });
        }

        return NextResponse.json({
          success: result,
          message: result ? 'Email de test envoyé avec succès' : 'Erreur lors de l\'envoi de l\'email de test',
          eventType: testEventType,
          email
        });

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
