import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Check LibreSpeed Access: API appelée');
    
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return new NextResponse('Missing userId', { status: 400 });
    }

    // Pour l'instant, autoriser l'accès à tous les utilisateurs
    // TODO: Implémenter la vérification réelle dans user_applications
    console.log('✅ Check LibreSpeed Access: Accès autorisé pour userId:', userId);

    return NextResponse.json({
      hasAccess: true,
      tokens: [], // Pas de tokens d'accès pour l'instant
      count: 1
    });

  } catch (error) {
    console.error('❌ Check LibreSpeed Access Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}