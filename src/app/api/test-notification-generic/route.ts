import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../utils/notificationService';

export async function POST(request: NextRequest) {
  try {
    const { eventType, userEmail, eventData } = await request.json();
    
    if (!eventType || !userEmail) {
      return NextResponse.json(
        { error: 'eventType et userEmail requis' },
        { status: 400 }
      );
    }

    console.log('🧪 Test de notification générique pour:', { eventType, userEmail, eventData });

    const notificationService = NotificationService.getInstance();
    
    // Test de la notification selon le type d'événement
    let result = false;
    
    switch (eventType) {
      case 'user_signup':
        result = await notificationService.sendUserSignupNotification(
          userEmail,
          eventData?.userName || 'Utilisateur Test'
        );
        break;
        
      case 'user_login':
        result = await notificationService.sendUserLoginNotification(
          userEmail,
          eventData?.userName || 'Utilisateur Test'
        );
        break;
        
      case 'module_activated':
        result = await notificationService.sendModuleActivatedNotification(
          userEmail,
          eventData?.userName || 'Utilisateur Test',
          eventData?.moduleName || 'Module Test'
        );
        break;
        
      case 'app_accessed':
        result = await notificationService.sendModuleActivatedNotification(
          userEmail,
          eventData?.userName || 'Utilisateur Test',
          eventData?.appName || 'Application Test'
        );
        break;
        
      case 'payment_success':
        result = await notificationService.sendPaymentSuccessNotification(
          userEmail,
          eventData?.userName || 'Utilisateur Test',
          eventData?.amount || '29.99€',
          eventData?.moduleName || 'Module Test'
        );
        break;
        
      default:
        return NextResponse.json(
          { error: `Type d'événement non supporté: ${eventType}` },
          { status: 400 }
        );
    }

    console.log('📧 Résultat du test:', result);

    return NextResponse.json({
      success: result,
      message: result ? 'Notification de test envoyée avec succès' : 'Échec de l\'envoi de la notification',
      debug: {
        eventType,
        userEmail,
        eventData: eventData || {},
        timestamp: new Date().toISOString()
      }
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
  try {
    const notificationService = NotificationService.getInstance();
    
    return NextResponse.json({
      success: true,
      message: 'Service de notification générique disponible',
      supportedEvents: [
        'user_created',
        'user_login', 
        'user_logout',
        'app_accessed',
        'module_activated'
      ],
      debug: {
        serviceInitialized: !!notificationService,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors du test du service:', error);
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

