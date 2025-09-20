import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🧪 Test Simple API appelée');
  
  try {
    const body = await request.json();
    console.log('🧪 Body reçu:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Test API fonctionne',
      body: body
    });
  } catch (error) {
    console.log('🧪 Erreur parsing JSON:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
