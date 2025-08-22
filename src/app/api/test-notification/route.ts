import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../utils/notificationService';

export async function POST(request: NextRequest) {
  try {
    const { email, appName, userName } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    console.log('🧪 Test de notification pour:', { email, appName, userName });

    const notificationService = NotificationService.getInstance();
    
    // Test de la notification d'accès à l'application
    const result = await notificationService.notifyAppAccessed(
      email,
      appName || 'Application Test',
      userName || 'Utilisateur Test'
    );

    console.log('📧 Résultat du test:', result);

    return NextResponse.json({
      success: result,
      message: result ? 'Notification de test envoyée avec succès' : 'Échec de l\'envoi de la notification',
      debug: {
        email,
        appName: appName || 'Application Test',
        userName: userName || 'Utilisateur Test',
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
      message: 'Service de notification disponible',
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
