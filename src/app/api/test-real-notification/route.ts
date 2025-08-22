import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../utils/notificationService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, appName, userName } = body;

    console.log('🧪 Test de notification réelle pour:', { email, appName, userName });

    // Simuler exactement ce qui se passe dans la page /encours
    const notificationService = NotificationService.getInstance();
    
    console.log('📧 Tentative d\'envoi de notification app_accessed...');
    
    const result = await notificationService.notifyAppAccessed(
      email,
      appName,
      userName
    );

    console.log('📧 Résultat de notifyAppAccessed:', result);

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Notification envoyée avec succès',
        debug: { email, appName, userName, timestamp: new Date().toISOString() }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Échec de l\'envoi de la notification',
        debug: { email, appName, userName, timestamp: new Date().toISOString() }
      });
    }
  } catch (error) {
    console.error('❌ Erreur dans test-real-notification:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
