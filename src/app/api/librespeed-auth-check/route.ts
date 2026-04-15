import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { LibreSpeedAccessService } from '../../../utils/librespeedAccess';
const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔒 LibreSpeed Auth Check: Vérification d\'authentification');
    
    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      ;
      return new NextResponse('Unauthorized - No cookies', { 
        status: 401,
        headers: {
          'X-Access-Granted': 'false'
        }
      });
    }

    // Créer un client Supabase avec les cookies
    const supabaseWithCookies = createClient(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            cookie: cookieHeader,
          },
        },
      }
    );

    // Vérifier la session
    const { data: { session }, error } = await supabaseWithCookies.auth.getSession();
    
    if (error || !session) {
      ;
      return new NextResponse('Unauthorized - Invalid session', { 
        status: 401,
        headers: {
          'X-Access-Granted': 'false'
        }
      });
    }

    // Vérifier l'accès à LibreSpeed
    const librespeedService = LibreSpeedAccessService.getInstance();
    const accessCheck = await librespeedService.checkAccess(session.user.id, session.user.email!);
    
    if (!accessCheck.hasAccess) {
      console.log('❌ LibreSpeed Auth Check: Accès refusé -', accessCheck.reason);
      return new NextResponse('Forbidden - Access denied', { 
        status: 403,
        headers: {
          'X-Access-Granted': 'false'
        }
      });
    }

    console.log('✅ LibreSpeed Auth Check: Accès autorisé pour', session.user.email);
    return new NextResponse('Access granted', { 
      status: 200,
      headers: {
        'X-Access-Granted': 'true',
        'X-User-Id': session.user.id,
        'X-User-Email': session.user.email!
      }
    });

  } catch (error) {
    console.error('❌ LibreSpeed Auth Check Error:', error);
    return new NextResponse('Internal Server Error', { 
      status: 500,
      headers: {
        'X-Access-Granted': 'false'
      }
    });
  }
}

export async function POST(request: NextRequest) {
  // Même logique que GET pour la compatibilité
  return GET(request);
}
