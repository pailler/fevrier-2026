import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test redirect route called');
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    return NextResponse.json({
      success: true,
      message: 'Test redirect route working',
      token: token || 'no token provided',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test redirect error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


























