import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, appName, userName } = body;

    console.log('🧪 Test simulation page /encours pour:', { email, appName, userName });

    // Simuler exactement ce qui se passe dans la page /encours
    if (email) {
      try {
        console.log('📧 Tentative d\'envoi de notification...');
        
        // Import dynamique comme dans /encours
        const { NotificationService } = await import('../../../utils/notificationService');
        const notificationService = NotificationService.getInstance();
        
        ;
        
        const result = await notificationService.sendModuleActivatedNotification(
          email,
          userName,
          appName
        );
        
        console.log('📧 Résultat de la notification:', result);
        
        if (result) {
          ;
          return NextResponse.json({
            success: true,
            message: 'Notification envoyée avec succès (simulation /encours)',
            debug: { email, appName, userName, timestamp: new Date().toISOString() }
          });
        } else {
          ;
          return NextResponse.json({
            success: false,
            message: 'Échec de l\'envoi de la notification (simulation /encours)',
            debug: { email, appName, userName, timestamp: new Date().toISOString() }
          });
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de la notification:', error);
        return NextResponse.json({
          success: false,
          message: 'Erreur lors de l\'envoi de la notification',
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }, { status: 500 });
      }
    } else {
      ;
      return NextResponse.json({
        success: false,
        message: 'Pas d\'email utilisateur disponible',
        debug: { email, appName, userName, timestamp: new Date().toISOString() }
      });
    }
  } catch (error) {
    console.error('❌ Erreur dans test-encours-notification:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
