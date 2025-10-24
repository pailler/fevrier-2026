import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const { qrId } = await params;
    
    console.log(`🔍 QR Redirect: ${qrId}`);
    
    // Récupérer les données du QR code depuis le stockage temporaire
    if (!global.qrCodes) {
      return NextResponse.json({ error: 'QR Code non trouvé' }, { status: 404 });
    }
    
    const qrData = global.qrCodes.get(qrId);
    
    if (!qrData) {
      return NextResponse.json({ error: 'QR Code non trouvé' }, { status: 404 });
    }
    
    // Incrémenter le compteur de scans
    qrData.scans = (qrData.scans || 0) + 1;
    qrData.last_scan = new Date();
    
    console.log(`✅ QR Redirect: ${qrData.url} (scans: ${qrData.scans})`);
    
    // Rediriger vers l'URL de destination
    return NextResponse.redirect(qrData.url, 302);
    
  } catch (error) {
    console.error('❌ Erreur QR Redirect:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
