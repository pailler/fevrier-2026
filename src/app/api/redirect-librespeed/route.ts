import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LibreSpeedAccessService } from '../../../utils/librespeedAccess';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
        console.log('❌ Token invalide ou expiré');
        return NextResponse.redirect('https://iahome.fr/encours?error=invalid_token', 302);
      }
      
      // Rediriger vers LibreSpeed avec le token
      const librespeedUrl = `https://librespeed.iahome.fr/?token=${token}`;
      console.log('✅ Redirection vers LibreSpeed avec token');
      return NextResponse.redirect(librespeedUrl, 302);
    }
    
    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('❌ LibreSpeed Redirect: Aucun cookie trouvé');
      return NextResponse.redirect('https://iahome.fr/login?redirect=/encours', 302);
    }

    // Créer un client Supabase avec les cookies
    const supabaseWithCookies = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      console.log('❌ LibreSpeed Redirect: Session invalide');
      return NextResponse.redirect('https://iahome.fr/login?redirect=/encours', 302);
    }

    // Vérifier l'accès à LibreSpeed
    const librespeedService = LibreSpeedAccessService.getInstance();
    const accessCheck = await librespeedService.checkAccess(session.user.id, session.user.email!);
    
    if (!accessCheck.hasAccess) {
      console.log('❌ LibreSpeed Redirect: Accès refusé -', accessCheck.reason);
      return NextResponse.redirect(`https://iahome.fr/encours?error=access_denied&reason=${encodeURIComponent(accessCheck.reason || 'Accès refusé')}`, 302);
    }

    // Générer un token d'accès temporaire
    const tokenResult = await librespeedService.generateAccessToken(session.user.id, session.user.email!);
    
    if (!tokenResult.hasAccess || !tokenResult.token) {
      console.log('❌ LibreSpeed Redirect: Erreur génération token');
      return NextResponse.redirect('https://iahome.fr/encours?error=token_generation_failed', 302);
    }

    // Rediriger vers LibreSpeed avec le token
    const librespeedUrl = `https://librespeed.iahome.fr/?token=${tokenResult.token}`;
    console.log('✅ LibreSpeed Redirect: Redirection vers LibreSpeed avec token');
    return NextResponse.redirect(librespeedUrl, 302);

  } catch (error) {
    console.error('❌ LibreSpeed Redirect Error:', error);
    return NextResponse.redirect('https://iahome.fr/encours?error=internal_error', 302);
  }
}
