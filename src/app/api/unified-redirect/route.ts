import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/supabaseConfig';
import { LibreSpeedAccessService } from '../../../utils/librespeedAccess';
import ModuleSecurityService from '../../../utils/moduleSecurityService';
import { getHunyuan3dAppUrl } from '@/utils/hunyuan3dAppUrl';
import { issueModuleAccessJwtWithDebit } from '@/utils/moduleAccessJwtIssue';
const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
);

// Mapping des modules vers leurs URLs de destination
const MODULE_URLS: { [key: string]: string } = {
  'librespeed': 'https://librespeed.iahome.fr',
  'metube': 'https://iahome.fr/metube',
  'pdf': 'https://pdf.iahome.fr',
  'qrcodes': 'https://qrcodes.iahome.fr',
  'stablediffusion': 'https://iahome.fr/stablediffusion',
  'ruinedfooocus': 'https://iahome.fr/ruinedfooocus', // passerelle ?token= → /ruinedfooocus/embed
  'resas-system': 'https://iahome.fr/resas-system', // passerelle ?token= → /resas-system/embed
  'apprendre-autrement': 'https://iahome.fr/apprendre-autrement',
  'ai-detector': 'https://iahome.fr/ai-detector',
  'comfyui': 'https://comfyui.iahome.fr',
  'cogstudio': 'https://cogstudio.iahome.fr',
  'hunyuan3d': getHunyuan3dAppUrl(),
  'photomaker': 'https://photomaker.iahome.fr',
  'birefnet': 'https://birefnet.iahome.fr',
  'musetalk': 'https://musetalk.iahome.fr',
  'photo-vivante': 'https://photo-vivante.iahome.fr',
  'florence-2': 'https://florence2.iahome.fr',
  'animagine-xl': 'https://animaginexl.iahome.fr',
  'reveil-intelligent': 'https://iahome.fr/reveil',
  'psitransfer': 'https://iahome.fr/psitransfer',
  'photobooth': 'https://iahome.fr/photobooth',
};

/**
 * Sous-domaines *.iahome.fr : on ajoute ?token= (JWT + débit) pour passer le worker Cloudflare.
 * MuseTalk : même URL ?token= que Florence-2 ; le worker accepte aussi le cookie musetalk_iahome_gate
 * sur GET / pour les revisites sans query.
 * Hors landing photobooth (mode invité) et hors site principal.
 */
function subdomainRequiresFirstPartyJwt(moduleId: string): boolean {
  const base = MODULE_URLS[moduleId];
  if (!base) return false;
  try {
    const host = new URL(base).hostname.toLowerCase();
    if (host === 'photobooth.iahome.fr') return false;
    if (host === 'iahome.fr' || host === 'www.iahome.fr') return false;
    return host.endsWith('.iahome.fr');
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔗 Unified Redirect: Redirection unifiée vers application');
    
    const url = new URL(request.url);
    const moduleIdRaw = url.searchParams.get('module');
    const moduleId = moduleIdRaw ? moduleIdRaw.trim().toLowerCase() : null;
    const token = url.searchParams.get('token');
    
    if (!moduleId) {
      ;
      return NextResponse.redirect('https://iahome.fr/account?error=no_module', 302);
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
          ;
          return NextResponse.redirect('https://iahome.fr/account?error=invalid_token', 302);
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
          ;
          return NextResponse.redirect('https://iahome.fr/account?error=invalid_token', 302);
        }

        // Vérifier l'accès au module
        const securityService = ModuleSecurityService.getInstance();
        const canAccess = await securityService.canAccessExternalApp(tokenData.created_by, moduleId);
        
        if (!canAccess) {
          const reason = await securityService.getAccessDenialReason(tokenData.created_by, moduleId);
          console.log('❌ Accès refusé:', reason);
          return NextResponse.redirect(`https://iahome.fr/account?error=access_denied&reason=${encodeURIComponent(reason)}`, 302);
        }
        
        // Marquer le token comme utilisé
        await supabase
          .from('access_tokens')
          .update({ is_used: true })
          .eq('id', tokenData.id);
        
        const base = MODULE_URLS[moduleId];
        const sep = base.includes('?') ? '&' : '?';
        const destinationUrl = `${base}${sep}token=${encodeURIComponent(token)}`;
        console.log('✅ Redirection avec token valide:', destinationUrl);
        return NextResponse.redirect(destinationUrl, 302);
      }
    }

    // Pas de token - vérifier l'authentification via cookies
    console.log('🍪 Vérification de l\'authentification via cookies...');
    
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

    // DÉSACTIVÉ : Plus de vérification de durée de session (déconnexion automatique supprimée)
    // La vérification de durée de session est désactivée pour permettre des sessions illimitées
    // const durationCheck = await checkSessionDuration(session);
    // 
    // if (!durationCheck.isValid) {
    //   console.log('❌ Session expirée:', durationCheck.reason);
    //   
    //   // Déconnecter Supabase Auth si la session a expiré
    //   try {
    //     await supabaseWithCookies.auth.signOut();
    //   } catch (error) {
    //     console.warn('⚠️ Erreur lors de la déconnexion Supabase:', error);
    //   }
    //   
    //   return NextResponse.redirect(`https://iahome.fr/login?redirect=/account&error=session_expired&message=${encodeURIComponent('Votre session a expiré après 1 heure. Veuillez vous reconnecter.')}`, 302);
    // }

    console.log('👤 Utilisateur authentifié:', session.user.email);

    // Vérifier l'accès au module
    if (moduleId === 'librespeed') {
      // Vérification spéciale pour LibreSpeed
      const librespeedService = LibreSpeedAccessService.getInstance();
      const accessCheck = await librespeedService.checkAccess(session.user.id, session.user.email!);
      
      if (!accessCheck.hasAccess) {
        console.log('❌ Accès LibreSpeed refusé:', accessCheck.reason);
        return NextResponse.redirect(`https://iahome.fr/account?error=access_denied&reason=${encodeURIComponent(accessCheck.reason || 'Accès refusé')}`, 302);
      }
      
      // Générer un token d'accès temporaire
      const tokenResult = await librespeedService.generateAccessToken(session.user.id, session.user.email!);
      
      if (!tokenResult.hasAccess || !tokenResult.token) {
        ;
        return NextResponse.redirect('https://iahome.fr/account?error=token_generation_failed', 302);
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
        return NextResponse.redirect(`https://iahome.fr/account?error=module_not_accessible&reason=${encodeURIComponent(reason)}`, 302);
      }

      const destinationUrl = MODULE_URLS[moduleId];
      if (subdomainRequiresFirstPartyJwt(moduleId)) {
        const issued = await issueModuleAccessJwtWithDebit({
          userId: session.user.id,
          userEmail: session.user.email!,
          moduleId,
        });
        if (issued.ok === false) {
          const fail = issued;
          console.log('❌ unified-redirect: émission JWT / crédits:', fail.code, fail.error);
          if (fail.code === 'INSUFFICIENT_TOKENS') {
            return NextResponse.redirect(
              `https://iahome.fr/account?error=insufficient_tokens&module=${encodeURIComponent(moduleId)}`,
              302
            );
          }
          return NextResponse.redirect(
            `https://iahome.fr/account?error=token_issue&code=${encodeURIComponent(fail.code)}`,
            302
          );
        }
        const sep = destinationUrl.includes('?') ? '&' : '?';
        const withToken = `${destinationUrl}${sep}token=${encodeURIComponent(issued.token)}`;
        console.log('✅ Redirection sous-domaine avec JWT (worker Cloudflare):', moduleId);
        return NextResponse.redirect(withToken, 302);
      }

      console.log('✅ Redirection directe vers:', destinationUrl);
      return NextResponse.redirect(destinationUrl, 302);
    }

  } catch (error) {
    console.error('❌ Unified Redirect Error:', error);
    return NextResponse.redirect('https://iahome.fr/account?error=internal_error', 302);
  }
}

export async function POST(request: NextRequest) {
  // Même logique que GET pour la compatibilité
  return GET(request);
}

