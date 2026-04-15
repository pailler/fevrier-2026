import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ModuleSecurityService from '../../../utils/moduleSecurityService';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔒 PsiTransfer Redirect: Vérification de sécurité');
    
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
        ;
        return NextResponse.redirect('https://iahome.fr/account?error=invalid_token', 302);
      }

      // Vérifier que le module psitransfer est visible dans /account pour cet utilisateur
      const securityService = ModuleSecurityService.getInstance();
      const canAccess = await securityService.canAccessExternalApp(tokenData.created_by, 'psitransfer');
      
      if (!canAccess) {
        const reason = await securityService.getAccessDenialReason(tokenData.created_by, 'psitransfer');
        console.log('❌ Accès refusé:', reason);
        return NextResponse.redirect(`https://iahome.fr/account?error=access_denied&reason=${encodeURIComponent(reason)}`, 302);
      }
      
      console.log('✅ Token valide et accès autorisé pour:', tokenData.created_by);
      
      // Marquer le token comme utilisé
      await supabase
        .from('access_tokens')
        .update({ is_used: true })
        .eq('id', tokenData.id);
      
      // Rediriger vers PsiTransfer
      console.log('🔗 Redirection vers PsiTransfer');
      return NextResponse.redirect('https://psitransfer.iahome.fr', 302);
    }
    
    // Si pas de token, vérifier l'origine de la requête
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('🔍 Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    const isFromIAHome = referer?.includes('iahome.fr') || origin?.includes('iahome.fr') || host?.includes('iahome.fr');
    
    if (!isFromIAHome) {
      ;
      return NextResponse.redirect('https://iahome.fr/login?error=direct_access_denied', 302);
    }
    
    // Récupérer les cookies de la requête pour vérifier la session
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      ;
      return NextResponse.redirect('https://iahome.fr/login?error=no_session', 302);
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
      return NextResponse.redirect('https://iahome.fr/login?error=invalid_session', 302);
    }
    
    // Vérifier que le module psitransfer est visible dans /account pour cet utilisateur
    const securityService = ModuleSecurityService.getInstance();
    const canAccess = await securityService.canAccessExternalApp(session.user.id, 'psitransfer');
    
    if (!canAccess) {
      const reason = await securityService.getAccessDenialReason(session.user.id, 'psitransfer');
      console.log('❌ Module non visible dans /account:', reason);
      return NextResponse.redirect(`https://iahome.fr/account?error=module_not_visible&reason=${encodeURIComponent(reason)}`, 302);
    }
    
    console.log('✅ Accès autorisé pour utilisateur:', session.user.email);
    
    // Rediriger vers PsiTransfer
    console.log('🔗 Redirection vers PsiTransfer');
    return NextResponse.redirect('https://psitransfer.iahome.fr', 302);
    
  } catch (error) {
    console.error('❌ Erreur PsiTransfer Redirect:', error);
    return NextResponse.redirect('https://iahome.fr/login?error=internal_error', 302);
  }
}


