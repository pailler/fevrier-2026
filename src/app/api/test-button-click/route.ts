import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, appName, userName } = body;

    console.log('🔘 Test simulation clic bouton pour:', { email, appName, userName });

    // Simuler un clic sur un bouton "Accéder à l'application"
    if (email) {
      try {
        console.log('🔘 Clic sur bouton détecté...');
        
        // Simuler l'import dynamique comme dans le bouton
        const { NotificationService } = await import('../../../utils/notificationService');
        const notificationService = NotificationService.getInstance();
        
        console.log('🔘 Service de notification chargé après clic');
        
        // Simuler l'appel exact du bouton
        const result = await notificationService.notifyAppAccessed(
          email,
          appName,
          userName
        );
        
        console.log('🔘 Résultat après clic sur bouton:', result);
        
        if (result) {
          console.log('✅ Notification envoyée après clic sur bouton');
          return NextResponse.json({
            success: true,
            message: 'Notification envoyée après clic sur bouton',
            debug: { 
              email, 
              appName, 
              userName, 
              timestamp: new Date().toISOString(),
              action: 'button-click-simulation'
            }
          });
        } else {
          console.log('❌ Échec notification après clic sur bouton');
          return NextResponse.json({
            success: false,
            message: 'Échec notification après clic sur bouton',
            debug: { 
              email, 
              appName, 
              userName, 
              timestamp: new Date().toISOString(),
              action: 'button-click-simulation'
            }
          });
        }
      } catch (error) {
        console.error('❌ Erreur après clic sur bouton:', error);
        return NextResponse.json({
          success: false,
          message: 'Erreur après clic sur bouton',
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          debug: { 
            email, 
            appName, 
            userName, 
            timestamp: new Date().toISOString(),
            action: 'button-click-simulation'
          }
        }, { status: 500 });
      }
    } else {
      console.log('⚠️ Pas d\'email pour simulation clic bouton');
      return NextResponse.json({
        success: false,
        message: 'Pas d\'email pour simulation clic bouton',
        debug: { 
          email, 
          appName, 
          userName, 
          timestamp: new Date().toISOString(),
          action: 'button-click-simulation'
        }
      });
    }
  } catch (error) {
    console.error('❌ Erreur dans test-button-click:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test clic bouton',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
