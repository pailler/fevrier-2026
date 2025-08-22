import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../utils/notificationService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userName } = body;

    console.log('🧪 Test notification de connexion pour:', { email, userName });

    // Test notification de connexion
    const notificationService = NotificationService.getInstance();
    
    console.log('📧 Tentative d\'envoi de notification user_login...');
    
    const result = await notificationService.notifyUserLogin(
      email,
      userName
    );

    console.log('📧 Résultat notification user_login:', result);

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur test notification connexion:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
