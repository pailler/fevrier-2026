import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ModuleSecurityService from '../../../utils/moduleSecurityService';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/supabaseConfig';
import { verifyGradioToken } from '../../../utils/gradioToken';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
);

const JWT_SECRET = process.env.JWT_SECRET || 'iahome-super-secret-jwt-key-2025-change-in-production';

// URL de l'application RuinedFooocus (Gradio)
// Utiliser l'URL Gradio directe pour éviter les boucles de redirection
const RUINEDFOOOCUS_URL = process.env.RUINEDFOOOCUS_GRADIO_URL || 'https://da4be546aab3e23055.gradio.live/';

export async function GET(request: NextRequest) {
  try {
    console.log('🔒 RuinedFooocus Redirect: Vérification de sécurité');
    
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('🔑 Token trouvé, vérification...');
      
      try {
        // Essayer de vérifier le token comme un token Gradio
        const gradioToken = verifyGradioToken(token);
        
        if (gradioToken) {
          console.log('✅ Token Gradio valide pour:', gradioToken.userEmail);
          
          // Vérifier que le module est bien ruinedfooocus
          if (gradioToken.moduleId !== 'ruinedfooocus') {
            console.log('❌ Token pour un autre module:', gradioToken.moduleId);
            return NextResponse.redirect('https://iahome.fr/account?error=invalid_module', 302);
          }
          
          // Vérifier l'accès utilisateur au module
          const securityService = ModuleSecurityService.getInstance();
          const canAccess = await securityService.canAccessExternalApp(gradioToken.userId, 'ruinedfooocus');
          
          if (!canAccess) {
            const reason = await securityService.getAccessDenialReason(gradioToken.userId, 'ruinedfooocus');
            console.log('❌ Accès refusé:', reason);
            return NextResponse.redirect(`https://iahome.fr/account?error=access_denied&reason=${encodeURIComponent(reason)}`, 302);
          }
          
          console.log('✅ Accès autorisé, redirection vers RuinedFooocus');
          
          // Rediriger vers RuinedFooocus avec le token
          const targetUrl = new URL(RUINEDFOOOCUS_URL);
          targetUrl.searchParams.set('token', token);
          
          return NextResponse.redirect(targetUrl.toString(), 302);
        }
      } catch (gradioError) {
        console.log('⚠️ Token n\'est pas un token Gradio, tentative JWT standard...');
      }
      
      // Essayer de vérifier comme un token JWT standard
      try {
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as any;
        
        console.log('✅ Token JWT valide pour:', decoded.userEmail || decoded.userId);
        
        // Vérifier que le module est bien ruinedfooocus
        if (decoded.moduleId && decoded.moduleId !== 'ruinedfooocus') {
          console.log('❌ Token pour un autre module:', decoded.moduleId);
          return NextResponse.redirect('https://iahome.fr/account?error=invalid_module', 302);
        }
        
        const userId = decoded.userId || decoded.user_id;
        if (!userId) {
          console.log('❌ Token sans userId');
          return NextResponse.redirect('https://iahome.fr/account?error=invalid_token', 302);
        }
        
        // Vérifier l'accès utilisateur au module
        const securityService = ModuleSecurityService.getInstance();
        const canAccess = await securityService.canAccessExternalApp(userId, 'ruinedfooocus');
        
        if (!canAccess) {
          const reason = await securityService.getAccessDenialReason(userId, 'ruinedfooocus');
          console.log('❌ Accès refusé:', reason);
          return NextResponse.redirect(`https://iahome.fr/account?error=access_denied&reason=${encodeURIComponent(reason)}`, 302);
        }
        
        console.log('✅ Accès autorisé, redirection vers RuinedFooocus');
        
        // Rediriger vers RuinedFooocus avec le token
        const targetUrl = new URL(RUINEDFOOOCUS_URL);
        targetUrl.searchParams.set('token', token);
        
        return NextResponse.redirect(targetUrl.toString(), 302);
        
      } catch (jwtError) {
        console.error('❌ Erreur vérification token JWT:', jwtError);
      }
      
      // Si aucune vérification n'a fonctionné, vérifier dans la base de données
      const { data: tokenData, error: tokenError } = await supabase
        .from('access_tokens')
        .select('id, created_by, expires_at, is_active, module_name')
        .eq('jwt_token', token)
        .eq('is_active', true)
        .single();
      
      if (tokenError || !tokenData) {
        console.log('❌ Token non trouvé dans la base de données');
        return NextResponse.redirect('https://iahome.fr/account?error=invalid_token', 302);
      }

      // Vérifier que le module ruinedfooocus est visible dans /account pour cet utilisateur
      const securityService = ModuleSecurityService.getInstance();
      const canAccess = await securityService.canAccessExternalApp(tokenData.created_by, 'ruinedfooocus');
      
      if (!canAccess) {
        const reason = await securityService.getAccessDenialReason(tokenData.created_by, 'ruinedfooocus');
        console.log('❌ Accès refusé:', reason);
        return NextResponse.redirect(`https://iahome.fr/account?error=access_denied&reason=${encodeURIComponent(reason)}`, 302);
      }
      
      console.log('✅ Token valide et accès autorisé pour:', tokenData.created_by);
      
      // Marquer le token comme utilisé
      await supabase
        .from('access_tokens')
        .update({ is_used: true })
        .eq('id', tokenData.id);
      
      // Rediriger vers RuinedFooocus avec le token
      const targetUrl = new URL(RUINEDFOOOCUS_URL);
      targetUrl.searchParams.set('token', token);
      
      return NextResponse.redirect(targetUrl.toString(), 302);
    }
    
    // Si pas de token, vérifier l'origine de la requête
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('🔍 Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    const isFromIAHome = referer?.includes('iahome.fr') || origin?.includes('iahome.fr') || host?.includes('iahome.fr');
    
    if (!isFromIAHome) {
      console.log('🛡️ Accès direct bloqué');
      return NextResponse.redirect('https://iahome.fr/login?error=direct_access_denied', 302);
    }
    
    // Récupérer les cookies de la requête pour vérifier la session
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('❌ Pas de cookies de session');
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
      console.log('❌ Session invalide');
      return NextResponse.redirect('https://iahome.fr/login?error=invalid_session', 302);
    }
    
    // Vérifier que le module ruinedfooocus est visible dans /account pour cet utilisateur
    const securityService = ModuleSecurityService.getInstance();
    const canAccess = await securityService.canAccessExternalApp(session.user.id, 'ruinedfooocus');
    
    if (!canAccess) {
      const reason = await securityService.getAccessDenialReason(session.user.id, 'ruinedfooocus');
      console.log('❌ Module non visible dans /account:', reason);
      return NextResponse.redirect(`https://iahome.fr/account?error=module_not_visible&reason=${encodeURIComponent(reason)}`, 302);
    }
    
    console.log('✅ Accès autorisé pour utilisateur:', session.user.email);
    
    // Générer un token pour l'utilisateur
    try {
      const tokenResponse = await fetch(`${request.nextUrl.origin}/api/generate-standard-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader,
        },
        body: JSON.stringify({
          userId: session.user.id,
          moduleId: 'ruinedfooocus',
        }),
      });
      
      if (tokenResponse.ok) {
        const { token: newToken } = await tokenResponse.json();
        
        // Rediriger vers RuinedFooocus avec le token
        const targetUrl = new URL(RUINEDFOOOCUS_URL);
        targetUrl.searchParams.set('token', newToken);
        
        return NextResponse.redirect(targetUrl.toString(), 302);
      }
    } catch (tokenError) {
      console.error('❌ Erreur génération token:', tokenError);
    }
    
    // Si la génération de token échoue, rediriger quand même vers RuinedFooocus
    // (l'application pourra vérifier la session)
    console.log('🔗 Redirection vers RuinedFooocus');
    return NextResponse.redirect(RUINEDFOOOCUS_URL, 302);
    
  } catch (error) {
    console.error('❌ Erreur RuinedFooocus Redirect:', error);
    return NextResponse.redirect('https://iahome.fr/login?error=internal_error', 302);
  }
}

export async function POST(request: NextRequest) {
  // Pour les requêtes POST, proxifier vers l'application RuinedFooocus
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 401 }
      );
    }
    
    // Vérifier le token rapidement
    try {
      jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as any;
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }
    
    // Récupérer le body de la requête
    const body = await request.text();
    
    // Transférer la requête vers RuinedFooocus
    const response = await fetch(RUINEDFOOOCUS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'IAHome-RuinedFooocus-Proxy',
        'Authorization': `Bearer ${token}`,
      },
      body: body,
    });
    
    // Retourner la réponse
    const responseData = await response.text();
    
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-RuinedFooocus-Proxy',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur POST RuinedFooocus Redirect:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

