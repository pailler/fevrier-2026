import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 LibreSpeed Token: API appelée');
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    };
    
    const body = await request.json();
    const { userId, userEmail } = body;
    
    if (!userId || !userEmail) {
      return new NextResponse('Missing userId or userEmail', { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Pour l'instant, autoriser l'accès à tous les utilisateurs (même logique que check-librespeed-access)
    // TODO: Implémenter la vérification réelle dans user_applications
    console.log('🔑 LibreSpeed: Génération token pour:', { userId, userEmail });
    
    // Générer un token aléatoire simple
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    console.log('✅ LibreSpeed Token: Token généré avec succès');
    return new NextResponse(JSON.stringify({
      success: true,
      token: token,
      expiresIn: 300 // 5 minutes
    }), { 
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ LibreSpeed Token Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new NextResponse('Bad Request - No token provided', { status: 400 });
    }

    // Validation simple du token (pour l'instant, accepter tous les tokens)
    // TODO: Implémenter une validation réelle si nécessaire
    console.log('✅ LibreSpeed Token: Token validé:', token.substring(0, 10) + '...');
    return new NextResponse('Token valid', { status: 200 });

  } catch (error) {
    console.error('❌ LibreSpeed Token Validation Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}