import { NextRequest, NextResponse } from 'next/server';
import { LibreSpeedAccessService } from '../../../utils/librespeedAccess';

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

    const librespeedService = LibreSpeedAccessService.getInstance();
    const result = await librespeedService.generateAccessToken(userId, userEmail);
    
    if (!result.hasAccess) {
      return new NextResponse(result.reason || 'Access denied', { 
        status: 403,
        headers: corsHeaders
      });
    }

    console.log('✅ LibreSpeed Token: Token généré avec succès');
    return new NextResponse(JSON.stringify({
      success: true,
      token: result.token,
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

    const librespeedService = LibreSpeedAccessService.getInstance();
    const result = await librespeedService.validateToken(token);
    
    if (!result.hasAccess) {
      return new NextResponse(result.reason || 'Invalid token', { status: 401 });
    }

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