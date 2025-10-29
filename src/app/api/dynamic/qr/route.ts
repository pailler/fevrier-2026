import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log(`🔍 QR Dynamic: Redirection vers service Python`);
    
    // Rediriger vers le service Python
    const pythonServiceUrl = process.env.NODE_ENV === 'production' 
      ? 'https://qrcodes.iahome.fr' 
      : 'http://localhost:7006';
    
    const response = await fetch(`${pythonServiceUrl}/api/dynamic/qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Service Python error: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Adapter l'URL de redirection pour utiliser le domaine correct
    if (result.redirect_url) {
      result.redirect_url = result.redirect_url.replace('http://localhost:7006', 'https://qrcodes.iahome.fr');
      result.redirect_url = result.redirect_url.replace('/redirect/', '/r/');
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Erreur QR Dynamic:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
