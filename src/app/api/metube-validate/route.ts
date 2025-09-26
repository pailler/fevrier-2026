import { NextRequest, NextResponse } from 'next/server';
import { MeTubeAccessService } from '../../../utils/metubeAccess';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({
        hasAccess: false,
        reason: 'Token manquant'
      }, { status: 400 });
    }
    
    const metubeService = MeTubeAccessService.getInstance();
    const validation = await metubeService.validateToken(token);
    
    return NextResponse.json(validation);
    
  } catch (error) {
    console.error('❌ MeTube Validate Error:', error);
    return NextResponse.json({
      hasAccess: false,
      reason: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}
