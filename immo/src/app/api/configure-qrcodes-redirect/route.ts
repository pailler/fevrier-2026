import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 QR Codes Redirect: Configuration de la redirection...');

    // Cette API peut être utilisée pour configurer la redirection Cloudflare
    // Pour l'instant, on retourne juste un succès
    
    return new NextResponse(JSON.stringify({
      success: true,
      message: 'QR codes redirect configured successfully',
      redirectUrl: '/qrcodes-redirect',
      instructions: [
        '1. Configurez Cloudflare pour rediriger qrcodes.iahome.fr vers /qrcodes-redirect',
        '2. Chaque utilisateur aura sa propre session QR codes',
        '3. Les sessions sont gérées automatiquement via /api/qr-session'
      ]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ QR Codes Redirect Config Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
