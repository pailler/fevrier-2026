import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { MeTubeAccessService } from '../../../utils/metubeAccess';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔒 MeTube Redirect: Vérification de sécurité');
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('🔑 Token trouvé, vérification...');
      
      // Vérifier le token avec le système d'autorisation
      const metubeService = MeTubeAccessService.getInstance();
      const tokenValidation = await metubeService.validateToken(token);
      
      if (!tokenValidation.hasAccess) {
        ;
        return NextResponse.redirect('https://iahome.fr/encours?error=invalid_token', 302);
      }
      
      // Incrémenter le compteur d'utilisation
      if (tokenValidation.userId) {
        await metubeService.incrementUsage(tokenValidation.userId);
      }
      
      // Rediriger vers MeTube local avec le token
      const metubeUrl = `http://192.168.1.150:8081/?token=${token}`;
      ;
      return NextResponse.redirect(metubeUrl, 302);
    }
    
    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      ;
      return NextResponse.redirect('https://iahome.fr/login?redirect=/encours', 302);
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
      return NextResponse.redirect('https://iahome.fr/login?redirect=/encours', 302);
    }

    // Vérifier l'accès à MeTube
    const metubeService = MeTubeAccessService.getInstance();
    const accessCheck = await metubeService.checkAccess(session.user.id, session.user.email!);
    
    if (!accessCheck.hasAccess) {
      console.log('❌ MeTube Redirect: Accès refusé -', accessCheck.reason);
      return NextResponse.redirect(`https://iahome.fr/encours?error=access_denied&reason=${encodeURIComponent(accessCheck.reason || 'Accès refusé')}`, 302);
    }

    // Générer un token d'accès temporaire
    const tokenResult = await metubeService.generateAccessToken(session.user.id, session.user.email!);
    
    if (!tokenResult.hasAccess || !tokenResult.token) {
      ;
      return NextResponse.redirect('https://iahome.fr/encours?error=token_generation_failed', 302);
    }

    // Rediriger vers MeTube local avec le token
    const metubeUrl = `http://192.168.1.150:8081/?token=${tokenResult.token}`;
    ;
    return NextResponse.redirect(metubeUrl, 302);

  } catch (error) {
    console.error('❌ MeTube Redirect Error:', error);
    return NextResponse.redirect('https://iahome.fr/encours?error=internal_error', 302);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

