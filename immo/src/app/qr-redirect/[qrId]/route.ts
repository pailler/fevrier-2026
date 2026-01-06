import { NextRequest, NextResponse } from 'next/server';

const QR_CODE_SERVICE_URL = process.env.QR_CODE_SERVICE_URL || 'https://qrcode.iahome.fr';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const pathParams = await params;
    const { qrId } = pathParams;
    
    console.log(`🔍 Redirection QR: ${qrId}`);
    
    // Récupérer l'URL de destination depuis le service QR
    const response = await fetch(`${QR_CODE_SERVICE_URL}/r/${qrId}`);
    
    if (!response.ok) {
      console.log(`❌ QR code non trouvé: ${qrId}`);
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    const data = await response.json();
    
    // Rediriger vers l'URL de destination
    if (data.redirect_url) {
      console.log(`✅ Redirection vers: ${data.redirect_url}`);
      return NextResponse.redirect(data.redirect_url);
    }
    
    console.log(`❌ Pas d'URL de redirection pour: ${qrId}`);
    return NextResponse.redirect(new URL('/404', request.url));
    
  } catch (error) {
    console.error('❌ Erreur redirection QR:', error);
    return NextResponse.redirect(new URL('/404', request.url));
  }
}
