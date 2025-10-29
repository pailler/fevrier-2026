import { NextRequest, NextResponse } from 'next/server';

const QR_CODE_SERVICE_URL = process.env.QR_CODE_SERVICE_URL || 'http://localhost:7006';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Construire l'URL de destination
    const targetUrl = `${QR_CODE_SERVICE_URL}/api/qr/static`;
    
    console.log(`🔍 QR Static: ${targetUrl}`);
    
    // Faire la requête vers le service QR (sans authentification)
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('❌ Erreur QR Static:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}




