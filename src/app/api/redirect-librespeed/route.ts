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
    console.log('🔒 LibreSpeed Redirect: Vérification de sécurité');
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('🔑 Token trouvé, vérification...');
      
      // Vérifier le token avec le système d'autorisation
      const librespeedService = LibreSpeedAccessService.getInstance();
      const tokenValidation = await librespeedService.validateToken(token);
      
      if (!tokenValidation.hasAccess) {
        ;
        return NextResponse.redirect('https://iahome.fr/account?error=invalid_token', 302);
      }
      
      // Rediriger vers LibreSpeed avec le token
      const librespeedUrl = `https://librespeed.iahome.fr/?token=${token}`;
      ;
      return NextResponse.redirect(librespeedUrl, 302);
    }
    
    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      ;
      return NextResponse.redirect('https://iahome.fr/login?redirect=/account', 302);
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
      return NextResponse.redirect('https://iahome.fr/login?redirect=/account', 302);
    }

    // Vérifier l'accès à LibreSpeed
    const librespeedService = LibreSpeedAccessService.getInstance();
    const accessCheck = await librespeedService.checkAccess(session.user.id, session.user.email!);
    
    if (!accessCheck.hasAccess) {
      console.log('❌ LibreSpeed Redirect: Accès refusé -', accessCheck.reason);
      return NextResponse.redirect(`https://iahome.fr/account?error=access_denied&reason=${encodeURIComponent(accessCheck.reason || 'Accès refusé')}`, 302);
    }

    // Générer un token d'accès temporaire
    const tokenResult = await librespeedService.generateAccessToken(session.user.id, session.user.email!);
    
    if (!tokenResult.hasAccess || !tokenResult.token) {
      ;
      return NextResponse.redirect('https://iahome.fr/account?error=token_generation_failed', 302);
    }

    // Rediriger vers LibreSpeed avec le token
    const librespeedUrl = `https://librespeed.iahome.fr/?token=${tokenResult.token}`;
    ;
    return NextResponse.redirect(librespeedUrl, 302);

  } catch (error) {
    console.error('❌ LibreSpeed Redirect Error:', error);
    return NextResponse.redirect('https://iahome.fr/account?error=internal_error', 302);
  }
}

