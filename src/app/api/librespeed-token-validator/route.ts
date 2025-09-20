import { NextRequest, NextResponse } from 'next/server';
import { LibreSpeedAccessService } from '../../../utils/librespeedAccess';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 LibreSpeed Token Validator: Vérification du token');
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      console.log('❌ LibreSpeed Token Validator: Aucun token fourni');
      return new NextResponse('Unauthorized - No token', { 
        status: 401,
        headers: {
          'X-Token-Valid': 'false'
        }
      });
    }

    // Valider le token avec le service LibreSpeed
    const librespeedService = LibreSpeedAccessService.getInstance();
    const tokenValidation = await librespeedService.validateToken(token);
    
    if (!tokenValidation.hasAccess) {
      console.log('❌ LibreSpeed Token Validator: Token invalide -', tokenValidation.reason);
      return new NextResponse('Unauthorized - Invalid token', { 
        status: 401,
        headers: {
          'X-Token-Valid': 'false'
        }
      });
    }

    console.log('✅ LibreSpeed Token Validator: Token valide');
    return new NextResponse('Token valid', { 
      status: 200,
      headers: {
        'X-Token-Valid': 'true'
      }
    });

  } catch (error) {
    console.error('❌ LibreSpeed Token Validator Error:', error);
    return new NextResponse('Internal Server Error', { 
      status: 500,
      headers: {
        'X-Token-Valid': 'false'
      }
    });
  }
}

export async function POST(request: NextRequest) {
  // Même logique que GET pour la compatibilité
  return GET(request);
}
