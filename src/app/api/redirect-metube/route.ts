import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ModuleSecurityService from '../../../utils/moduleSecurityService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔒 MeTube Redirect: Vérification de sécurité');
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('🔑 Token trouvé, vérification...');
      
      // Vérifier le token avec le système d'autorisation
      const { data: tokenData, error: tokenError } = await supabase
        .from('access_tokens')
        .select('id, created_by, expires_at, is_active, module_name')
        .eq('jwt_token', token)
        .eq('is_active', true)
        .single();
      
      if (tokenError || !tokenData) {
        console.log('❌ Token invalide ou expiré');
        return NextResponse.redirect('https://iahome.fr/encours?error=invalid_token', 302);
      }
      
      // Vérifier l'expiration du token
      if (tokenData.expires_at) {
        const expirationDate = new Date(tokenData.expires_at);
        const now = new Date();
        
        if (expirationDate <= now) {
          console.log('❌ Token expiré');
          return NextResponse.redirect('https://iahome.fr/encours?error=token_expired', 302);
        }
      }
      
      // Vérifier que le module metube est visible dans /encours pour cet utilisateur
      const securityService = ModuleSecurityService.getInstance();
      const canAccess = await securityService.canAccessExternalApp(tokenData.created_by, 'metube');
      
      if (!canAccess) {
        const reason = await securityService.getAccessDenialReason(tokenData.created_by, 'metube');
        console.log('❌ Accès refusé:', reason);
        return NextResponse.redirect(`https://iahome.fr/encours?error=access_denied&reason=${encodeURIComponent(reason)}`, 302);
      }
      
      console.log('✅ Token valide et accès autorisé pour:', tokenData.created_by);
      
      // Marquer le token comme utilisé
      await supabase
        .from('access_tokens')
        .update({ is_used: true })
        .eq('id', tokenData.id);
      
      // Rediriger vers MeTube
      console.log('🔗 Redirection vers MeTube');
      return NextResponse.redirect('https://metube.iahome.fr', 302);
    }
    
    // Si pas de token, vérifier l'origine de la requête
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('🔍 Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    const isFromIAHome = referer?.includes('iahome.fr') || origin?.includes('iahome.fr') || host?.includes('iahome.fr');
    
    if (!isFromIAHome) {
      console.log('❌ Accès direct bloqué - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login?error=direct_access_denied', 302);
    }
    
    // Récupérer les cookies de la requête pour vérifier la session
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('❌ Aucun cookie trouvé - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login?error=no_session', 302);
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
      console.log('❌ Session invalide - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login?error=invalid_session', 302);
    }
    
    // Vérifier que le module metube est visible dans /encours pour cet utilisateur
    const securityService = ModuleSecurityService.getInstance();
    const canAccess = await securityService.canAccessExternalApp(session.user.id, 'metube');
    
    if (!canAccess) {
      const reason = await securityService.getAccessDenialReason(session.user.id, 'metube');
      console.log('❌ Module non visible dans /encours:', reason);
      return NextResponse.redirect(`https://iahome.fr/encours?error=module_not_visible&reason=${encodeURIComponent(reason)}`, 302);
    }
    
    console.log('✅ Accès autorisé pour utilisateur:', session.user.email);
    
    // Rediriger vers MeTube
    console.log('🔗 Redirection vers MeTube');
    return NextResponse.redirect('https://metube.iahome.fr', 302);
    
  } catch (error) {
    console.error('❌ Erreur MeTube Redirect:', error);
    return NextResponse.redirect('https://iahome.fr/login?error=internal_error', 302);
  }
}
