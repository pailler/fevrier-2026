import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ModuleSecurityService from '../../../utils/moduleSecurityService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔒 RuinedFooocus Redirect: Vérification de sécurité');
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      // Vérifier le token
      const { data: tokenData, error: tokenError } = await supabase
        .from('access_tokens')
        .select('id, created_by, expires_at, is_active, module_name')
        .eq('jwt_token', token)
        .eq('is_active', true)
        .single();
      
      if (tokenError || !tokenData) {
        return NextResponse.redirect('https://iahome.fr/encours?error=invalid_token', 302);
      }
      
      // Vérifier l'expiration
      if (tokenData.expires_at) {
        const expirationDate = new Date(tokenData.expires_at);
        if (expirationDate <= new Date()) {
          return NextResponse.redirect('https://iahome.fr/encours?error=token_expired', 302);
        }
      }
      
      // Vérifier l'accès
      const securityService = ModuleSecurityService.getInstance();
      const canAccess = await securityService.canAccessExternalApp(tokenData.created_by, 'ruinedfooocus');
      
      if (!canAccess) {
        const reason = await securityService.getAccessDenialReason(tokenData.created_by, 'ruinedfooocus');
        return NextResponse.redirect(`https://iahome.fr/encours?error=access_denied&reason=${encodeURIComponent(reason)}`, 302);
      }
      
      // Marquer comme utilisé
      await supabase
        .from('access_tokens')
        .update({ is_used: true })
        .eq('id', tokenData.id);
      
      return NextResponse.redirect('https://ruinedfooocus.iahome.fr', 302);
    }
    
    // Vérifier l'origine
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    const isFromIAHome = referer?.includes('iahome.fr') || origin?.includes('iahome.fr') || host?.includes('iahome.fr');
    
    if (!isFromIAHome) {
      return NextResponse.redirect('https://iahome.fr/login?error=direct_access_denied', 302);
    }
    
    // Vérifier la session
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.redirect('https://iahome.fr/login?error=no_session', 302);
    }
    
    const supabaseWithCookies = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { cookie: cookieHeader } },
      }
    );
    
    const { data: { session }, error } = await supabaseWithCookies.auth.getSession();
    
    if (error || !session) {
      return NextResponse.redirect('https://iahome.fr/login?error=invalid_session', 302);
    }
    
    // Vérifier l'accès au module
    const securityService = ModuleSecurityService.getInstance();
    const canAccess = await securityService.canAccessExternalApp(session.user.id, 'ruinedfooocus');
    
    if (!canAccess) {
      const reason = await securityService.getAccessDenialReason(session.user.id, 'ruinedfooocus');
      return NextResponse.redirect(`https://iahome.fr/encours?error=module_not_visible&reason=${encodeURIComponent(reason)}`, 302);
    }
    
    return NextResponse.redirect('https://ruinedfooocus.iahome.fr', 302);
    
  } catch (error) {
    console.error('❌ Erreur RuinedFooocus Redirect:', error);
    return NextResponse.redirect('https://iahome.fr/login?error=internal_error', 302);
  }
}

