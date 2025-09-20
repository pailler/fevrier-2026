import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LibreSpeedAccessService } from '../../../utils/librespeedAccess';
import ModuleSecurityService from '../../../utils/moduleSecurityService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Mapping des modules vers leurs URLs de destination
const MODULE_URLS: { [key: string]: string } = {
  'librespeed': 'https://librespeed.iahome.fr',
  'metube': 'https://metube.iahome.fr',
  'pdf': 'https://pdf.iahome.fr',
  'psitransfer': 'https://psitransfer.iahome.fr',
  'qrcodes': 'https://qrcodes.iahome.fr',
  'converter': 'https://convert.iahome.fr',
  'stablediffusion': 'https://stablediffusion.iahome.fr',
  'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
  'invoke': 'https://invoke.iahome.fr',
  'comfyui': 'https://comfyui.iahome.fr',
  'cogstudio': 'https://cogstudio.iahome.fr',
  'sdnext': 'https://sdnext.iahome.fr'
};

export async function GET(request: NextRequest) {
  try {
    console.log('🔗 Unified Redirect: Redirection unifiée vers application');
    
    const url = new URL(request.url);
    const moduleId = url.searchParams.get('module');
    const token = url.searchParams.get('token');
    
    if (!moduleId) {
      console.log('❌ Unified Redirect: Module non spécifié');
      return NextResponse.redirect('https://iahome.fr/encours?error=no_module', 302);
    }

    console.log('📱 Module demandé:', moduleId);

    // Si un token est fourni, le valider
    if (token) {
      console.log('🔑 Token fourni, validation...');
      
      if (moduleId === 'librespeed') {
        // Validation spéciale pour LibreSpeed
        const librespeedService = LibreSpeedAccessService.getInstance();
        const tokenValidation = await librespeedService.validateToken(token);
        
        if (!tokenValidation.hasAccess) {
          console.log('❌ Token LibreSpeed invalide');
          return NextResponse.redirect('https://iahome.fr/encours?error=invalid_token', 302);
        }
        
        const destinationUrl = `${MODULE_URLS[moduleId]}?token=${token}`;
        console.log('✅ Redirection LibreSpeed avec token:', destinationUrl);
        return NextResponse.redirect(destinationUrl, 302);
      } else {
        // Validation standard pour les autres modules
        const { data: tokenData, error: tokenError } = await supabase
          .from('access_tokens')
          .select('id, created_by, expires_at, is_active, module_name')
          .eq('jwt_token', token)
          .eq('is_active', true)
          .single();
        
        if (tokenError || !tokenData) {
          console.log('❌ Token invalide');
          return NextResponse.redirect('https://iahome.fr/encours?error=invalid_token', 302);
        }
        
        // Vérifier l'expiration
        if (tokenData.expires_at && new Date(tokenData.expires_at) <= new Date()) {
          console.log('❌ Token expiré');
          return NextResponse.redirect('https://iahome.fr/encours?error=token_expired', 302);
        }
        
        // Vérifier l'accès au module
        const securityService = ModuleSecurityService.getInstance();
        const canAccess = await securityService.canAccessExternalApp(tokenData.created_by, moduleId);
        
        if (!canAccess) {
          const reason = await securityService.getAccessDenialReason(tokenData.created_by, moduleId);
          console.log('❌ Accès refusé:', reason);
          return NextResponse.redirect(`https://iahome.fr/encours?error=access_denied&reason=${encodeURIComponent(reason)}`, 302);
        }
        
        // Marquer le token comme utilisé
        await supabase
          .from('access_tokens')
          .update({ is_used: true })
          .eq('id', tokenData.id);
        
        const destinationUrl = MODULE_URLS[moduleId];
        console.log('✅ Redirection avec token valide:', destinationUrl);
        return NextResponse.redirect(destinationUrl, 302);
      }
    }

    // Pas de token - vérifier l'authentification via cookies
    console.log('🍪 Vérification de l\'authentification via cookies...');
    
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      console.log('❌ Aucun cookie trouvé');
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
      console.log('❌ Session invalide');
      return NextResponse.redirect('https://iahome.fr/login?redirect=/encours', 302);
    }

    console.log('👤 Utilisateur authentifié:', session.user.email);

    // Vérifier l'accès au module
    if (moduleId === 'librespeed') {
      // Vérification spéciale pour LibreSpeed
      const librespeedService = LibreSpeedAccessService.getInstance();
      const accessCheck = await librespeedService.checkAccess(session.user.id, session.user.email!);
      
      if (!accessCheck.hasAccess) {
        console.log('❌ Accès LibreSpeed refusé:', accessCheck.reason);
        return NextResponse.redirect(`https://iahome.fr/encours?error=access_denied&reason=${encodeURIComponent(accessCheck.reason || 'Accès refusé')}`, 302);
      }
      
      // Générer un token d'accès temporaire
      const tokenResult = await librespeedService.generateAccessToken(session.user.id, session.user.email!);
      
      if (!tokenResult.hasAccess || !tokenResult.token) {
        console.log('❌ Erreur génération token LibreSpeed');
        return NextResponse.redirect('https://iahome.fr/encours?error=token_generation_failed', 302);
      }
      
      const destinationUrl = `${MODULE_URLS[moduleId]}?token=${tokenResult.token}`;
      console.log('✅ Redirection LibreSpeed avec nouveau token:', destinationUrl);
      return NextResponse.redirect(destinationUrl, 302);
    } else {
      // Vérification standard pour les autres modules
      const securityService = ModuleSecurityService.getInstance();
      const canAccess = await securityService.canAccessExternalApp(session.user.id, moduleId);
      
      if (!canAccess) {
        const reason = await securityService.getAccessDenialReason(session.user.id, moduleId);
        console.log('❌ Module non accessible:', reason);
        return NextResponse.redirect(`https://iahome.fr/encours?error=module_not_accessible&reason=${encodeURIComponent(reason)}`, 302);
      }
      
      const destinationUrl = MODULE_URLS[moduleId];
      console.log('✅ Redirection directe vers:', destinationUrl);
      return NextResponse.redirect(destinationUrl, 302);
    }

  } catch (error) {
    console.error('❌ Unified Redirect Error:', error);
    return NextResponse.redirect('https://iahome.fr/encours?error=internal_error', 302);
  }
}

export async function POST(request: NextRequest) {
  // Même logique que GET pour la compatibilité
  return GET(request);
}
