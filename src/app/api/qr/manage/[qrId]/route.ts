import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const { qrId } = await params;
    const token = request.nextUrl.searchParams.get('token');
    
    console.log(`🔍 QR Manage: ${qrId} (token: ${token})`);
    
    // Récupérer les données du QR code
    if (!global.qrCodes) {
      return NextResponse.json({ error: 'QR Code non trouvé' }, { status: 404 });
    }
    
    const qrData = global.qrCodes.get(qrId);
    
    if (!qrData) {
      return NextResponse.json({ error: 'QR Code non trouvé' }, { status: 404 });
    }
    
    // Retourner les informations de gestion
    return NextResponse.json({
      success: true,
      qr_id: qrId,
      name: qrData.name,
      url: qrData.url,
      scans: qrData.scans || 0,
      created_at: qrData.created_at,
      last_scan: qrData.last_scan || null
    });
    
  } catch (error) {
    console.error('❌ Erreur QR Manage:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const { qrId } = await params;
    const body = await request.json();
    const { url, name, token } = body;
    
    console.log(`🔍 QR Update: ${qrId} -> ${url}`);
    
    // Récupérer les données du QR code
    if (!global.qrCodes) {
      return NextResponse.json({ error: 'QR Code non trouvé' }, { status: 404 });
    }
    
    const qrData = global.qrCodes.get(qrId);
    
    if (!qrData) {
      return NextResponse.json({ error: 'QR Code non trouvé' }, { status: 404 });
    }
    
    // Mettre à jour les données
    if (url) qrData.url = url;
    if (name) qrData.name = name;
    
    console.log(`✅ QR Update: ${qrId} -> ${qrData.url}`);
    
    return NextResponse.json({
      success: true,
      message: 'QR Code mis à jour avec succès',
      qr_id: qrId,
      url: qrData.url,
      name: qrData.name
    });
    
  } catch (error) {
    console.error('❌ Erreur QR Update:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
