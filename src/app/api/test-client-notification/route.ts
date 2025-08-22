import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, appName, userName } = body;

    console.log('🧪 Test simulation côté client pour:', { email, appName, userName });

    // Simuler exactement ce qui se passe côté client
    if (email) {
      try {
        console.log('📧 Tentative d\'envoi de notification côté client...');
        
        // Simuler l'import dynamique côté client
        const { NotificationService } = await import('../../../utils/notificationService');
        const notificationService = NotificationService.getInstance();
        
        console.log('✅ Service de notification chargé côté client');
        
        // Simuler l'appel exact comme dans le bouton
        const result = await notificationService.notifyAppAccessed(
          email,
          appName,
          userName
        );
        
        console.log('📧 Résultat de la notification côté client:', result);
        
        if (result) {
          console.log('✅ Notification envoyée avec succès côté client');
          return NextResponse.json({
            success: true,
            message: 'Notification envoyée avec succès (simulation côté client)',
            debug: { 
              email, 
              appName, 
              userName, 
              timestamp: new Date().toISOString(),
              method: 'client-side-simulation'
            }
          });
        } else {
          console.log('❌ Échec de l\'envoi de la notification côté client');
          return NextResponse.json({
            success: false,
            message: 'Échec de l\'envoi de la notification (simulation côté client)',
            debug: { 
              email, 
              appName, 
              userName, 
              timestamp: new Date().toISOString(),
              method: 'client-side-simulation'
            }
          });
        }
      } catch (error) {
        console.error('❌ Erreur côté client lors de l\'envoi de la notification:', error);
        return NextResponse.json({
          success: false,
          message: 'Erreur côté client lors de l\'envoi de la notification',
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          debug: { 
            email, 
            appName, 
            userName, 
            timestamp: new Date().toISOString(),
            method: 'client-side-simulation'
          }
        }, { status: 500 });
      }
    } else {
      console.log('⚠️ Pas d\'email utilisateur disponible côté client');
      return NextResponse.json({
        success: false,
        message: 'Pas d\'email utilisateur disponible (simulation côté client)',
        debug: { 
          email, 
          appName, 
          userName, 
          timestamp: new Date().toISOString(),
          method: 'client-side-simulation'
        }
      });
    }
  } catch (error) {
    console.error('❌ Erreur dans test-client-notification:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test côté client',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
