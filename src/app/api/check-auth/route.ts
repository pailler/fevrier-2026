import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import AuthorizationService from '../../../utils/authorizationService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('LibreSpeed Auth: Début de la vérification');
    
    // Test de base de données pour LibreSpeed (temporaire) - AVANT les autres vérifications
    const url = new URL(request.url);
    if (url.searchParams.get('test-db') === 'true') {
      console.log('🧪 Test de base de données demandé');
      return testLibreSpeedDatabase();
    }
    
    // Vérifier si c'est une requête de proxy LibreSpeed, MeTube, PsiTransfer, PDF, StableDiffusion, RuinedFooocus, ComfyUI, SDNext, Invoke ou QR Codes
    const host = request.headers.get('host');
    const isLibreSpeedProxy = host?.includes('librespeed.iahome.fr');
    const isMeTubeProxy = host?.includes('metube.iahome.fr');
    const isPsiTransferProxy = host?.includes('psitransfer.iahome.fr');
    const isPdfProxy = host?.includes('pdf.iahome.fr');
    const isStableDiffusionProxy = host?.includes('stablediffusion.iahome.fr');
    const isRuinedFooocusProxy = host?.includes('ruinedfooocus.iahome.fr');
    const isComfyUIProxy = host?.includes('comfyui.iahome.fr');
    const isSDNextProxy = host?.includes('sdnext.iahome.fr');
    const isInvokeProxy = host?.includes('invoke.iahome.fr');
    const isQRCodesProxy = host?.includes('qrcodes.iahome.fr');
    
    if (isLibreSpeedProxy) {
      return handleLibreSpeedProxy(request);
    }
    
    if (isMeTubeProxy) {
      return handleMeTubeProxy(request);
    }
    
    if (isPsiTransferProxy) {
      return handlePsiTransferProxy(request);
    }
    
    if (isPdfProxy) {
      return handlePdfProxy(request);
    }
    
    if (isStableDiffusionProxy) {
      return handleStableDiffusionProxy(request);
    }
    
    if (isRuinedFooocusProxy) {
      return handleRuinedFooocusProxy(request);
    }
    
    if (isComfyUIProxy) {
      return handleComfyUIProxy(request);
    }
    
    if (isSDNextProxy) {
      return handleSDNextProxy(request);
    }
    
    if (isInvokeProxy) {
      return handleInvokeProxy(request);
    }
    
    if (isQRCodesProxy) {
      return handleQRCodesProxy(request);
    }
    
    // Vérifier que la requête vient bien de iahome.fr
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    
    console.log('LibreSpeed Auth: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('LibreSpeed Auth: Accès direct bloqué - referer:', referer, 'origin:', origin, 'host:', host);
      return new NextResponse('Forbidden - Direct access not allowed', { status: 403 });
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('LibreSpeed Auth: Aucun cookie trouvé');
      return new NextResponse('Unauthorized - No cookies', { status: 401 });
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
    
    if (error) {
      console.error('LibreSpeed Auth: Erreur lors de la vérification de la session:', error);
      return new NextResponse('Unauthorized - Session error', { status: 401 });
    }

    if (!session) {
      console.log('LibreSpeed Auth: Aucune session trouvée');
      return new NextResponse('Unauthorized - No session', { status: 401 });
    }

    // TODO: Vérifier si l'utilisateur a accès au module LibreSpeed
    // TODO: Vérifier si le module apparaît dans /encours
    
    console.log('LibreSpeed Auth: Accès autorisé pour utilisateur:', session.user.email);
    
    // Retourner les headers utilisateur pour LibreSpeed
    return new NextResponse('OK', {
      status: 200,
      headers: {
        'X-User-Id': session.user.id,
        'X-User-Email': session.user.email || 'unknown@example.com',
        'X-User-Name': session.user.user_metadata?.full_name || 'Utilisateur',
      }
    });

  } catch (error) {
    console.error('LibreSpeed Auth Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour gérer le proxy LibreSpeed
async function handleLibreSpeedProxy(request: NextRequest) {
  try {
    console.log('LibreSpeed Proxy: Début de la vérification');
    
    // Vérifier s'il y a un token ou magic_link dans les paramètres de requête
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || url.searchParams.get('magic_link');
    
    if (token) {
      console.log('LibreSpeed Proxy: Token/Magic link trouvé, vérification...');
      
      // Vérifier le token avec le système d'autorisation
      const authorizationService = AuthorizationService.getInstance();
      const validationResult = await authorizationService.validateAccessToken(token);
      
      if (!validationResult.valid) {
        console.log('LibreSpeed Proxy: Token invalide - redirection vers accueil:', validationResult.reason);
        return NextResponse.redirect('https://iahome.fr/encours?error=token_invalid', 302);
      }
      
      console.log('LibreSpeed Proxy: Token validé avec succès pour:', validationResult.userInfo?.userEmail);
      
      // Proxifier vers le service LibreSpeed interne avec le token
      console.log('LibreSpeed Proxy: Proxification vers LibreSpeed avec token');
      return proxyToLibreSpeed(request, token);
    }
    
    // Si pas de token, vérifier l'origine de la requête (accès direct bloqué)
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('LibreSpeed Proxy: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('LibreSpeed Proxy: Accès direct bloqué - redirection vers accueil');
      return NextResponse.redirect('https://iahome.fr/encours?error=access_denied', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('LibreSpeed Proxy: Aucun cookie trouvé - redirection vers accueil');
      return NextResponse.redirect('https://iahome.fr/encours?error=no_session', 302);
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
    
    if (error) {
      console.error('LibreSpeed Proxy: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/encours?error=session_error', 302);
    }

    if (!session) {
      console.log('LibreSpeed Proxy: Aucune session trouvée - redirection vers accueil');
      return NextResponse.redirect('https://iahome.fr/encours?error=no_session', 302);
    }

    // Vérifier si le module apparaît dans /encours (vérification principale)
    const isModuleInEncours = await checkModuleInEncours(session.user.id);
    
    if (!isModuleInEncours) {
      console.log('LibreSpeed Proxy: Module LibreSpeed non visible dans /encours pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/encours?error=module_not_available', 302);
    }

    // Vérifier que l'utilisateur a un accès de base au module (sans vérifier quotas)
    const hasBasicAccess = await checkBasicModuleAccess(session.user.id);
    
    if (!hasBasicAccess) {
      console.log('LibreSpeed Proxy: Aucun accès LibreSpeed trouvé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/encours?error=no_access', 302);
    }
    
    console.log('LibreSpeed Proxy: Accès autorisé pour utilisateur:', session.user.email);
    
    // Incrémenter le compteur d'utilisation (le système existant gère les quotas)
    await incrementUsageCount(session.user.id);
    
    // Proxifier vers le service LibreSpeed interne
    console.log('LibreSpeed Proxy: Proxification vers LibreSpeed');
    return proxyToLibreSpeed(request);

  } catch (error) {
    console.error('LibreSpeed Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour vérifier l'accès de base au module LibreSpeed (sans vérifier quotas)
async function checkBasicModuleAccess(userId: string): Promise<boolean> {
  try {
    console.log('LibreSpeed Proxy: Vérification accès de base pour utilisateur:', userId);
    
    // Récupérer l'accès au module LibreSpeed depuis user_applications
    const { data: moduleAccess, error: accessError } = await supabase
      .from('user_applications')
      .select(`
        id,
        user_id,
        module_id,
        module_title,
        is_active
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.librespeed,module_title.ilike.%librespeed%')
      .single();

    if (accessError || !moduleAccess) {
      console.log('LibreSpeed Proxy: Aucun accès LibreSpeed trouvé pour l\'utilisateur');
      return false;
    }

    console.log('LibreSpeed Proxy: Accès LibreSpeed de base trouvé pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('LibreSpeed Proxy: Erreur vérification accès de base:', error);
    return false;
  }
}

// Fonction pour vérifier si le module apparaît dans /encours
async function checkModuleInEncours(userId: string): Promise<boolean> {
  try {
    console.log('LibreSpeed Proxy: Vérification module dans /encours pour utilisateur:', userId);
    
    // Vérifier que le module LibreSpeed existe et est visible
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, category, price, is_visible')
      .or('id.eq.librespeed,title.ilike.%librespeed%')
      .single();

    if (moduleError || !moduleData) {
      console.log('LibreSpeed Proxy: Module LibreSpeed non trouvé dans la base de données');
      return false;
    }

    // Vérifier que le module est visible (apparaît dans /encours)
    if (moduleData.is_visible === false) {
      console.log('LibreSpeed Proxy: Module LibreSpeed masqué dans /encours');
      return false;
    }

    // Vérifier que l'utilisateur a un accès actif au module (sans vérifier expiration)
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, module_title')
      .eq('user_id', userId)
      .eq('module_id', moduleData.id)
      .eq('is_active', true)
      .single();

    if (accessError || !userAccess) {
      console.log('LibreSpeed Proxy: Aucun accès utilisateur trouvé pour LibreSpeed');
      return false;
    }

    console.log('LibreSpeed Proxy: Module LibreSpeed visible dans /encours pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('LibreSpeed Proxy: Erreur vérification module /encours:', error);
    return false;
  }
}

// Fonction pour incrémenter le compteur d'utilisation
async function incrementUsageCount(userId: string): Promise<void> {
  try {
    console.log('LibreSpeed Proxy: Incrémentation du compteur d\'utilisation pour:', userId);
    
    // Trouver l'accès au module LibreSpeed
    const { data: moduleAccess, error: findError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.librespeed,module_title.ilike.%librespeed%')
      .single();

    if (findError || !moduleAccess) {
      console.log('LibreSpeed Proxy: Impossible de trouver l\'accès au module pour incrémenter');
      return;
    }

    // Note: Les quotas sont gérés par le système existant, on incrémente juste le compteur

    // Incrémenter le compteur
    const { error: updateError } = await supabase
      .from('user_applications')
      .update({ 
        usage_count: moduleAccess.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleAccess.id);

    if (updateError) {
      console.error('LibreSpeed Proxy: Erreur lors de l\'incrémentation:', updateError);
    } else {
      console.log('LibreSpeed Proxy: Compteur d\'utilisation incrémenté avec succès');
    }
  } catch (error) {
    console.error('LibreSpeed Proxy: Erreur incrémentation compteur:', error);
  }
}

// Fonction de test de la base de données LibreSpeed
async function testLibreSpeedDatabase() {
  try {
    console.log('🧪 Test de la base de données LibreSpeed...');

    // 1. Vérifier si le module LibreSpeed existe
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, category, price')
      .or('id.eq.librespeed,title.ilike.%librespeed%')
      .single();

    if (moduleError) {
      console.log('❌ Module LibreSpeed non trouvé:', moduleError.message);
      return NextResponse.json({
        success: false,
        error: 'Module LibreSpeed non trouvé',
        details: moduleError
      });
    }

    console.log('✅ Module LibreSpeed trouvé:', moduleData);

    // 2. Créer le module s'il n'existe pas
    if (!moduleData) {
      console.log('📝 Création du module LibreSpeed...');
      
      const { data: newModule, error: createError } = await supabase
        .from('modules')
        .insert([{
          id: 'librespeed',
          title: 'LibreSpeed',
          description: 'Test de vitesse internet rapide et précis.',
          subtitle: 'Test de vitesse internet',
          category: 'WEB TOOLS',
          price: 0,
          url: '/librespeed-interface',
          image_url: '/images/librespeed.jpg',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur création module:', createError);
        return NextResponse.json({
          success: false,
          error: 'Erreur création module',
          details: createError
        });
      }

      console.log('✅ Module LibreSpeed créé:', newModule);
    }

    // 3. Lister tous les modules pour vérification
    const { data: allModules, error: allModulesError } = await supabase
      .from('modules')
      .select('id, title, category, price')
      .order('title', { ascending: true });

    if (allModulesError) {
      console.error('❌ Erreur récupération modules:', allModulesError);
      return NextResponse.json({
        success: false,
        error: 'Erreur récupération modules',
        details: allModulesError
      });
    }

    // 4. Vérifier les accès utilisateur
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, user_id, module_id, module_title, is_active, usage_count, max_usage')
      .or('module_id.eq.librespeed,module_title.ilike.%librespeed%')
      .limit(10);

    if (accessError) {
      console.log('⚠️ Erreur récupération accès utilisateur:', accessError.message);
    }

    console.log('✅ Test de base de données terminé avec succès');

    return NextResponse.json({
      success: true,
      message: 'Test de base de données LibreSpeed réussi',
      data: {
        module: moduleData,
        allModules: allModules?.slice(0, 5), // Premiers 5 modules
        userAccess: userAccess || [],
        stats: {
          totalModules: allModules?.length || 0,
          librespeedAccess: userAccess?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur test base de données:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error
    }, { status: 500 });
  }
}

// Fonction pour gérer le proxy MeTube
async function handleMeTubeProxy(request: NextRequest) {
  try {
    console.log('MeTube Proxy: Début de la vérification');
    
    // Vérifier s'il y a un token dans les paramètres de requête
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('MeTube Proxy: Token trouvé, vérification du token temporaire');
      
      // Vérifier le token avec le système d'autorisation
      const authorizationService = AuthorizationService.getInstance();
      const validationResult = await authorizationService.validateAccessToken(token);
      
      if (!validationResult.valid) {
        console.log('MeTube Proxy: Token invalide - redirection vers login:', validationResult.reason);
        return NextResponse.redirect('https://iahome.fr/login', 302);
      }
      
      console.log('MeTube Proxy: Token validé avec succès pour:', validationResult.userInfo?.userEmail);
      
      // Rediriger vers MeTube (URL de production)
      console.log('MeTube Proxy: Redirection vers MeTube');
      return NextResponse.redirect('https://metube.iahome.fr', 302);
    }
    
    // Si pas de token, vérifier l'origine de la requête (accès direct bloqué)
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('MeTube Proxy: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('MeTube Proxy: Accès direct bloqué - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('MeTube Proxy: Aucun cookie trouvé - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
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
    
    if (error) {
      console.error('MeTube Proxy: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    if (!session) {
      console.log('MeTube Proxy: Aucune session trouvée - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier si le module apparaît dans /encours (vérification principale)
    const isModuleInEncours = await checkMeTubeModuleInEncours(session.user.id);
    
    if (!isModuleInEncours) {
      console.log('MeTube Proxy: Module MeTube non visible dans /encours pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier que l'utilisateur a un accès de base au module (sans vérifier quotas)
    const hasBasicAccess = await checkBasicMeTubeAccess(session.user.id);
    
    if (!hasBasicAccess) {
      console.log('MeTube Proxy: Aucun accès MeTube trouvé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }
    
    console.log('MeTube Proxy: Accès autorisé pour utilisateur:', session.user.email);
    
    // Incrémenter le compteur d'utilisation (le système existant gère les quotas)
    await incrementMeTubeUsageCount(session.user.id);
    
    // Rediriger directement vers MeTube
    console.log('MeTube Proxy: Redirection vers MeTube');
    return NextResponse.redirect('https://metube.iahome.fr', 302);

  } catch (error) {
    console.error('MeTube Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour vérifier l'accès de base au module MeTube (sans vérifier quotas)
async function checkBasicMeTubeAccess(userId: string): Promise<boolean> {
  try {
    console.log('MeTube Proxy: Vérification accès de base pour utilisateur:', userId);
    
    // Récupérer l'accès au module MeTube depuis user_applications
    const { data: moduleAccess, error: accessError } = await supabase
      .from('user_applications')
      .select(`
        id,
        user_id,
        module_id,
        module_title,
        is_active
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.metube,module_title.ilike.%metube%')
      .single();

    if (accessError || !moduleAccess) {
      console.log('MeTube Proxy: Aucun accès MeTube trouvé pour l\'utilisateur');
      return false;
    }

    console.log('MeTube Proxy: Accès MeTube de base trouvé pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('MeTube Proxy: Erreur vérification accès de base:', error);
    return false;
  }
}

// Fonction pour vérifier si le module MeTube apparaît dans /encours
async function checkMeTubeModuleInEncours(userId: string): Promise<boolean> {
  try {
    console.log('MeTube Proxy: Vérification module dans /encours pour utilisateur:', userId);
    
    // Vérifier que le module MeTube existe et est visible
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, category, price, is_visible')
      .or('id.eq.metube,title.ilike.%metube%')
      .single();

    if (moduleError || !moduleData) {
      console.log('MeTube Proxy: Module MeTube non trouvé dans la base de données');
      return false;
    }

    // Vérifier que le module est visible (apparaît dans /encours)
    if (moduleData.is_visible === false) {
      console.log('MeTube Proxy: Module MeTube masqué dans /encours');
      return false;
    }

    // Vérifier que l'utilisateur a un accès actif au module (sans vérifier expiration)
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, module_title')
      .eq('user_id', userId)
      .eq('module_id', moduleData.id)
      .eq('is_active', true)
      .single();

    if (accessError || !userAccess) {
      console.log('MeTube Proxy: Aucun accès utilisateur trouvé pour MeTube');
      return false;
    }

    console.log('MeTube Proxy: Module MeTube visible dans /encours pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('MeTube Proxy: Erreur vérification module /encours:', error);
    return false;
  }
}

// Fonction pour incrémenter le compteur d'utilisation MeTube
async function incrementMeTubeUsageCount(userId: string): Promise<void> {
  try {
    console.log('MeTube Proxy: Incrémentation du compteur d\'utilisation pour:', userId);
    
    // Trouver l'accès au module MeTube
    const { data: moduleAccess, error: findError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.metube,module_title.ilike.%metube%')
      .single();

    if (findError || !moduleAccess) {
      console.log('MeTube Proxy: Impossible de trouver l\'accès au module pour incrémenter');
      return;
    }

    // Note: Les quotas sont gérés par le système existant, on incrémente juste le compteur

    // Incrémenter le compteur
    const { error: updateError } = await supabase
      .from('user_applications')
      .update({ 
        usage_count: moduleAccess.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleAccess.id);

    if (updateError) {
      console.error('MeTube Proxy: Erreur lors de l\'incrémentation:', updateError);
    } else {
      console.log('MeTube Proxy: Compteur d\'utilisation incrémenté avec succès');
    }
  } catch (error) {
    console.error('MeTube Proxy: Erreur incrémentation compteur:', error);
  }
}

// Fonction pour gérer le proxy PsiTransfer
async function handlePsiTransferProxy(request: NextRequest) {
  try {
    console.log('PsiTransfer Proxy: Début de la vérification');
    
    // Vérifier s'il y a un token dans les paramètres de requête
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('PsiTransfer Proxy: Token trouvé, vérification du token temporaire');
      
      // Vérifier le token avec le système d'autorisation
      const authorizationService = AuthorizationService.getInstance();
      const validationResult = await authorizationService.validateAccessToken(token);
      
      if (!validationResult.valid) {
        console.log('PsiTransfer Proxy: Token invalide - redirection vers login:', validationResult.reason);
        return NextResponse.redirect('https://iahome.fr/login', 302);
      }
      
      console.log('PsiTransfer Proxy: Token validé avec succès pour:', validationResult.userInfo?.userEmail);
      
      // Rediriger vers PsiTransfer (URL de production)
      console.log('PsiTransfer Proxy: Redirection vers PsiTransfer');
      return NextResponse.redirect('https://psitransfer.iahome.fr', 302);
    }
    
    // Si pas de token, vérifier l'origine de la requête (accès direct bloqué)
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('PsiTransfer Proxy: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('PsiTransfer Proxy: Accès direct bloqué - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('PsiTransfer Proxy: Aucun cookie trouvé - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
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
    
    if (error) {
      console.error('PsiTransfer Proxy: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    if (!session) {
      console.log('PsiTransfer Proxy: Aucune session trouvée - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier si le module apparaît dans /encours (vérification principale)
    const isModuleInEncours = await checkPsiTransferModuleInEncours(session.user.id);
    
    if (!isModuleInEncours) {
      console.log('PsiTransfer Proxy: Module PsiTransfer non visible dans /encours pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier que l'utilisateur a un accès de base au module (sans vérifier quotas)
    const hasBasicAccess = await checkBasicPsiTransferAccess(session.user.id);
    
    if (!hasBasicAccess) {
      console.log('PsiTransfer Proxy: Aucun accès PsiTransfer trouvé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }
    
    console.log('PsiTransfer Proxy: Accès autorisé pour utilisateur:', session.user.email);
    
    // Incrémenter le compteur d'utilisation (le système existant gère les quotas)
    await incrementPsiTransferUsageCount(session.user.id);
    
    // Rediriger directement vers PsiTransfer
    console.log('PsiTransfer Proxy: Redirection vers PsiTransfer');
    return NextResponse.redirect('https://psitransfer.iahome.fr', 302);

  } catch (error) {
    console.error('PsiTransfer Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour vérifier l'accès de base au module PsiTransfer (sans vérifier quotas)
async function checkBasicPsiTransferAccess(userId: string): Promise<boolean> {
  try {
    console.log('PsiTransfer Proxy: Vérification accès de base pour utilisateur:', userId);
    
    // Récupérer l'accès au module PsiTransfer depuis user_applications
    const { data: moduleAccess, error: accessError } = await supabase
      .from('user_applications')
      .select(`
        id,
        user_id,
        module_id,
        module_title,
        is_active
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.psitransfer,module_title.ilike.%psitransfer%')
      .single();

    if (accessError || !moduleAccess) {
      console.log('PsiTransfer Proxy: Aucun accès PsiTransfer trouvé pour l\'utilisateur');
      return false;
    }

    console.log('PsiTransfer Proxy: Accès PsiTransfer de base trouvé pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('PsiTransfer Proxy: Erreur vérification accès de base:', error);
    return false;
  }
}

// Fonction pour vérifier si le module PsiTransfer apparaît dans /encours
async function checkPsiTransferModuleInEncours(userId: string): Promise<boolean> {
  try {
    console.log('PsiTransfer Proxy: Vérification module dans /encours pour utilisateur:', userId);
    
    // Vérifier que le module PsiTransfer existe et est visible
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, category, price, is_visible')
      .or('id.eq.psitransfer,title.ilike.%psitransfer%')
      .single();

    if (moduleError || !moduleData) {
      console.log('PsiTransfer Proxy: Module PsiTransfer non trouvé dans la base de données');
      return false;
    }

    // Vérifier que le module est visible (apparaît dans /encours)
    if (moduleData.is_visible === false) {
      console.log('PsiTransfer Proxy: Module PsiTransfer masqué dans /encours');
      return false;
    }

    // Vérifier que l'utilisateur a un accès actif au module (sans vérifier expiration)
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, module_title')
      .eq('user_id', userId)
      .eq('module_id', moduleData.id)
      .eq('is_active', true)
      .single();

    if (accessError || !userAccess) {
      console.log('PsiTransfer Proxy: Aucun accès utilisateur trouvé pour PsiTransfer');
      return false;
    }

    console.log('PsiTransfer Proxy: Module PsiTransfer visible dans /encours pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('PsiTransfer Proxy: Erreur vérification module /encours:', error);
    return false;
  }
}

// Fonction pour incrémenter le compteur d'utilisation PsiTransfer
async function incrementPsiTransferUsageCount(userId: string): Promise<void> {
  try {
    console.log('PsiTransfer Proxy: Incrémentation du compteur d\'utilisation pour:', userId);
    
    // Trouver l'accès au module PsiTransfer
    const { data: moduleAccess, error: findError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.psitransfer,module_title.ilike.%psitransfer%')
      .single();

    if (findError || !moduleAccess) {
      console.log('PsiTransfer Proxy: Impossible de trouver l\'accès au module pour incrémenter');
      return;
    }

    // Note: Les quotas sont gérés par le système existant, on incrémente juste le compteur

    // Incrémenter le compteur
    const { error: updateError } = await supabase
      .from('user_applications')
      .update({ 
        usage_count: moduleAccess.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleAccess.id);

    if (updateError) {
      console.error('PsiTransfer Proxy: Erreur lors de l\'incrémentation:', updateError);
    } else {
      console.log('PsiTransfer Proxy: Compteur d\'utilisation incrémenté avec succès');
    }
  } catch (error) {
    console.error('PsiTransfer Proxy: Erreur incrémentation compteur:', error);
  }
}

// Fonction pour gérer le proxy PDF
async function handlePdfProxy(request: NextRequest) {
  try {
    console.log('PDF Proxy: Début de la vérification');
    
    // Vérifier s'il y a un token dans les paramètres de requête
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('PDF Proxy: Token trouvé, vérification du token temporaire');
      
      // Vérifier le token avec le système d'autorisation
      const authorizationService = AuthorizationService.getInstance();
      const validationResult = await authorizationService.validateAccessToken(token);
      
      if (!validationResult.valid) {
        console.log('PDF Proxy: Token invalide - redirection vers login:', validationResult.reason);
        return NextResponse.redirect('https://iahome.fr/login', 302);
      }
      
      console.log('PDF Proxy: Token validé avec succès pour:', validationResult.userInfo?.userEmail);
      
      // Rediriger vers PDF (URL de production)
      console.log('PDF Proxy: Redirection vers PDF');
      return NextResponse.redirect('https://pdf.iahome.fr', 302);
    }
    
    // Si pas de token, vérifier l'origine de la requête (accès direct bloqué)
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('PDF Proxy: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('PDF Proxy: Accès direct bloqué - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('PDF Proxy: Aucun cookie trouvé - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
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
    
    if (error) {
      console.error('PDF Proxy: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    if (!session) {
      console.log('PDF Proxy: Aucune session trouvée - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier si le module apparaît dans /encours (vérification principale)
    const isModuleInEncours = await checkPdfModuleInEncours(session.user.id);
    
    if (!isModuleInEncours) {
      console.log('PDF Proxy: Module PDF non visible dans /encours pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier que l'utilisateur a un accès de base au module (sans vérifier quotas)
    const hasBasicAccess = await checkBasicPdfAccess(session.user.id);
    
    if (!hasBasicAccess) {
      console.log('PDF Proxy: Aucun accès PDF trouvé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }
    
    console.log('PDF Proxy: Accès autorisé pour utilisateur:', session.user.email);
    
    // Incrémenter le compteur d'utilisation (le système existant gère les quotas)
    await incrementPdfUsageCount(session.user.id);
    
    // Rediriger directement vers PDF
    console.log('PDF Proxy: Redirection vers PDF');
    return NextResponse.redirect('https://pdf.iahome.fr', 302);

  } catch (error) {
    console.error('PDF Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour vérifier l'accès de base au module PDF (sans vérifier quotas)
async function checkBasicPdfAccess(userId: string): Promise<boolean> {
  try {
    console.log('PDF Proxy: Vérification accès de base pour utilisateur:', userId);
    
    // Récupérer l'accès au module PDF depuis user_applications
    const { data: moduleAccess, error: accessError } = await supabase
      .from('user_applications')
      .select(`
        id,
        user_id,
        module_id,
        module_title,
        is_active
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.pdf,module_title.ilike.%pdf%')
      .single();

    if (accessError || !moduleAccess) {
      console.log('PDF Proxy: Aucun accès PDF trouvé pour l\'utilisateur');
      return false;
    }

    console.log('PDF Proxy: Accès PDF de base trouvé pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('PDF Proxy: Erreur vérification accès de base:', error);
    return false;
  }
}

// Fonction pour vérifier si le module PDF apparaît dans /encours
async function checkPdfModuleInEncours(userId: string): Promise<boolean> {
  try {
    console.log('PDF Proxy: Vérification module dans /encours pour utilisateur:', userId);
    
    // Vérifier que le module PDF existe et est visible
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, category, price, is_visible')
      .or('id.eq.pdf,title.ilike.%pdf%')
      .single();

    if (moduleError || !moduleData) {
      console.log('PDF Proxy: Module PDF non trouvé dans la base de données');
      return false;
    }

    // Vérifier que le module est visible (apparaît dans /encours)
    if (moduleData.is_visible === false) {
      console.log('PDF Proxy: Module PDF masqué dans /encours');
      return false;
    }

    // Vérifier que l'utilisateur a un accès actif au module (sans vérifier expiration)
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, module_title')
      .eq('user_id', userId)
      .eq('module_id', moduleData.id)
      .eq('is_active', true)
      .single();

    if (accessError || !userAccess) {
      console.log('PDF Proxy: Aucun accès utilisateur trouvé pour PDF');
      return false;
    }

    console.log('PDF Proxy: Module PDF visible dans /encours pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('PDF Proxy: Erreur vérification module /encours:', error);
    return false;
  }
}

// Fonction pour incrémenter le compteur d'utilisation PDF
async function incrementPdfUsageCount(userId: string): Promise<void> {
  try {
    console.log('PDF Proxy: Incrémentation du compteur d\'utilisation pour:', userId);
    
    // Trouver l'accès au module PDF
    const { data: moduleAccess, error: findError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.pdf,module_title.ilike.%pdf%')
      .single();

    if (findError || !moduleAccess) {
      console.log('PDF Proxy: Impossible de trouver l\'accès au module pour incrémenter');
      return;
    }

    // Note: Les quotas sont gérés par le système existant, on incrémente juste le compteur

    // Incrémenter le compteur
    const { error: updateError } = await supabase
      .from('user_applications')
      .update({ 
        usage_count: moduleAccess.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleAccess.id);

    if (updateError) {
      console.error('PDF Proxy: Erreur lors de l\'incrémentation:', updateError);
    } else {
      console.log('PDF Proxy: Compteur d\'utilisation incrémenté avec succès');
    }
  } catch (error) {
    console.error('PDF Proxy: Erreur incrémentation compteur:', error);
  }
}

// Fonction pour gérer le proxy StableDiffusion
async function handleStableDiffusionProxy(request: NextRequest) {
  try {
    console.log('StableDiffusion Proxy: Début de la vérification');
    
    // Vérifier s'il y a un token dans les paramètres de requête
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('StableDiffusion Proxy: Token trouvé, vérification du token temporaire');
      
      // Vérifier le token avec le système d'autorisation
      const authorizationService = AuthorizationService.getInstance();
      const validationResult = await authorizationService.validateAccessToken(token);
      
      if (!validationResult.valid) {
        console.log('StableDiffusion Proxy: Token invalide - redirection vers login:', validationResult.reason);
        return NextResponse.redirect('https://iahome.fr/login', 302);
      }
      
      console.log('StableDiffusion Proxy: Token validé avec succès pour:', validationResult.userInfo?.userEmail);
      
      // Rediriger vers StableDiffusion (URL de production)
      console.log('StableDiffusion Proxy: Redirection vers StableDiffusion');
      return NextResponse.redirect('https://stablediffusion.iahome.fr', 302);
    }
    
    // Si pas de token, vérifier l'origine de la requête (accès direct bloqué)
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('StableDiffusion Proxy: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('StableDiffusion Proxy: Accès direct bloqué - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('StableDiffusion Proxy: Aucun cookie trouvé - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
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
    
    if (error) {
      console.error('StableDiffusion Proxy: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    if (!session) {
      console.log('StableDiffusion Proxy: Aucune session trouvée - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier si le module apparaît dans /encours (vérification principale)
    const isModuleInEncours = await checkStableDiffusionModuleInEncours(session.user.id);
    
    if (!isModuleInEncours) {
      console.log('StableDiffusion Proxy: Module StableDiffusion non visible dans /encours pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier que l'utilisateur a un accès de base au module (sans vérifier quotas)
    const hasBasicAccess = await checkBasicStableDiffusionAccess(session.user.id);
    
    if (!hasBasicAccess) {
      console.log('StableDiffusion Proxy: Aucun accès StableDiffusion trouvé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }
    
    console.log('StableDiffusion Proxy: Accès autorisé pour utilisateur:', session.user.email);
    
    // Incrémenter le compteur d'utilisation (le système existant gère les quotas)
    await incrementStableDiffusionUsageCount(session.user.id);
    
    // Rediriger directement vers StableDiffusion
    console.log('StableDiffusion Proxy: Redirection vers StableDiffusion');
    return NextResponse.redirect('https://stablediffusion.iahome.fr', 302);

  } catch (error) {
    console.error('StableDiffusion Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour vérifier l'accès de base au module StableDiffusion (sans vérifier quotas)
async function checkBasicStableDiffusionAccess(userId: string): Promise<boolean> {
  try {
    console.log('StableDiffusion Proxy: Vérification accès de base pour utilisateur:', userId);
    
    // Récupérer l'accès au module StableDiffusion depuis user_applications
    const { data: moduleAccess, error: accessError } = await supabase
      .from('user_applications')
      .select(`
        id,
        user_id,
        module_id,
        module_title,
        is_active
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.stablediffusion,module_title.ilike.%stablediffusion%')
      .single();

    if (accessError || !moduleAccess) {
      console.log('StableDiffusion Proxy: Aucun accès StableDiffusion trouvé pour l\'utilisateur');
      return false;
    }

    console.log('StableDiffusion Proxy: Accès StableDiffusion de base trouvé pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('StableDiffusion Proxy: Erreur vérification accès de base:', error);
    return false;
  }
}

// Fonction pour vérifier si le module StableDiffusion apparaît dans /encours
async function checkStableDiffusionModuleInEncours(userId: string): Promise<boolean> {
  try {
    console.log('StableDiffusion Proxy: Vérification module dans /encours pour utilisateur:', userId);
    
    // Vérifier que le module StableDiffusion existe et est visible
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, category, price, is_visible')
      .or('id.eq.stablediffusion,title.ilike.%stablediffusion%')
      .single();

    if (moduleError || !moduleData) {
      console.log('StableDiffusion Proxy: Module StableDiffusion non trouvé dans la base de données');
      return false;
    }

    // Vérifier que le module est visible (apparaît dans /encours)
    if (moduleData.is_visible === false) {
      console.log('StableDiffusion Proxy: Module StableDiffusion masqué dans /encours');
      return false;
    }

    // Vérifier que l'utilisateur a un accès actif au module (sans vérifier expiration)
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, module_title')
      .eq('user_id', userId)
      .eq('module_id', moduleData.id)
      .eq('is_active', true)
      .single();

    if (accessError || !userAccess) {
      console.log('StableDiffusion Proxy: Aucun accès utilisateur trouvé pour StableDiffusion');
      return false;
    }

    console.log('StableDiffusion Proxy: Module StableDiffusion visible dans /encours pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('StableDiffusion Proxy: Erreur vérification module /encours:', error);
    return false;
  }
}

// Fonction pour incrémenter le compteur d'utilisation StableDiffusion
async function incrementStableDiffusionUsageCount(userId: string): Promise<void> {
  try {
    console.log('StableDiffusion Proxy: Incrémentation du compteur d\'utilisation pour:', userId);
    
    // Trouver l'accès au module StableDiffusion
    const { data: moduleAccess, error: findError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.stablediffusion,module_title.ilike.%stablediffusion%')
      .single();

    if (findError || !moduleAccess) {
      console.log('StableDiffusion Proxy: Impossible de trouver l\'accès au module pour incrémenter');
      return;
    }

    // Note: Les quotas sont gérés par le système existant, on incrémente juste le compteur

    // Incrémenter le compteur
    const { error: updateError } = await supabase
      .from('user_applications')
      .update({ 
        usage_count: moduleAccess.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleAccess.id);

    if (updateError) {
      console.error('StableDiffusion Proxy: Erreur lors de l\'incrémentation:', updateError);
    } else {
      console.log('StableDiffusion Proxy: Compteur d\'utilisation incrémenté avec succès');
    }
  } catch (error) {
    console.error('StableDiffusion Proxy: Erreur incrémentation compteur:', error);
  }
}

// Fonction pour gérer le proxy RuinedFooocus
async function handleRuinedFooocusProxy(request: NextRequest) {
  try {
    console.log('RuinedFooocus Proxy: Début de la vérification');
    
    // Vérifier s'il y a un token dans les paramètres de requête
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('RuinedFooocus Proxy: Token trouvé, vérification du token temporaire');
      
      // Vérifier le token avec le système d'autorisation
      const authorizationService = AuthorizationService.getInstance();
      const validationResult = await authorizationService.validateAccessToken(token);
      
      if (!validationResult.valid) {
        console.log('RuinedFooocus Proxy: Token invalide - redirection vers login:', validationResult.reason);
        return NextResponse.redirect('https://iahome.fr/login', 302);
      }
      
      console.log('RuinedFooocus Proxy: Token validé avec succès pour:', validationResult.userInfo?.userEmail);
      
      // Rediriger vers RuinedFooocus (URL de production)
      console.log('RuinedFooocus Proxy: Redirection vers RuinedFooocus');
      return NextResponse.redirect('https://ruinedfooocus.iahome.fr', 302);
    }
    
    // Si pas de token, vérifier l'origine de la requête (accès direct bloqué)
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('RuinedFooocus Proxy: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('RuinedFooocus Proxy: Accès direct bloqué - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('RuinedFooocus Proxy: Aucun cookie trouvé - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
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
    
    if (error) {
      console.error('RuinedFooocus Proxy: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    if (!session) {
      console.log('RuinedFooocus Proxy: Aucune session trouvée - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier si le module apparaît dans /encours (vérification principale)
    const isModuleInEncours = await checkRuinedFooocusModuleInEncours(session.user.id);
    
    if (!isModuleInEncours) {
      console.log('RuinedFooocus Proxy: Module RuinedFooocus non visible dans /encours pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier que l'utilisateur a un accès de base au module (sans vérifier quotas)
    const hasBasicAccess = await checkBasicRuinedFooocusAccess(session.user.id);
    
    if (!hasBasicAccess) {
      console.log('RuinedFooocus Proxy: Aucun accès RuinedFooocus trouvé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }
    
    console.log('RuinedFooocus Proxy: Accès autorisé pour utilisateur:', session.user.email);
    
    // Incrémenter le compteur d'utilisation (le système existant gère les quotas)
    await incrementRuinedFooocusUsageCount(session.user.id);
    
    // Rediriger directement vers RuinedFooocus
    console.log('RuinedFooocus Proxy: Redirection vers RuinedFooocus');
    return NextResponse.redirect('https://ruinedfooocus.iahome.fr', 302);

  } catch (error) {
    console.error('RuinedFooocus Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour vérifier l'accès de base au module RuinedFooocus (sans vérifier quotas)
async function checkBasicRuinedFooocusAccess(userId: string): Promise<boolean> {
  try {
    console.log('RuinedFooocus Proxy: Vérification accès de base pour utilisateur:', userId);
    
    // Récupérer l'accès au module RuinedFooocus depuis user_applications
    const { data: moduleAccess, error: accessError } = await supabase
      .from('user_applications')
      .select(`
        id,
        user_id,
        module_id,
        module_title,
        is_active
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.ruinedfooocus,module_title.ilike.%ruinedfooocus%')
      .single();

    if (accessError || !moduleAccess) {
      console.log('RuinedFooocus Proxy: Aucun accès RuinedFooocus trouvé pour l\'utilisateur');
      return false;
    }

    console.log('RuinedFooocus Proxy: Accès RuinedFooocus de base trouvé pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('RuinedFooocus Proxy: Erreur vérification accès de base:', error);
    return false;
  }
}

// Fonction pour vérifier si le module RuinedFooocus apparaît dans /encours
async function checkRuinedFooocusModuleInEncours(userId: string): Promise<boolean> {
  try {
    console.log('RuinedFooocus Proxy: Vérification module dans /encours pour utilisateur:', userId);
    
    // Vérifier que le module RuinedFooocus existe et est visible
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, category, price, is_visible')
      .or('id.eq.ruinedfooocus,title.ilike.%ruinedfooocus%')
      .single();

    if (moduleError || !moduleData) {
      console.log('RuinedFooocus Proxy: Module RuinedFooocus non trouvé dans la base de données');
      return false;
    }

    // Vérifier que le module est visible (apparaît dans /encours)
    if (moduleData.is_visible === false) {
      console.log('RuinedFooocus Proxy: Module RuinedFooocus masqué dans /encours');
      return false;
    }

    // Vérifier que l'utilisateur a un accès actif au module (sans vérifier expiration)
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, module_title')
      .eq('user_id', userId)
      .eq('module_id', moduleData.id)
      .eq('is_active', true)
      .single();

    if (accessError || !userAccess) {
      console.log('RuinedFooocus Proxy: Aucun accès utilisateur trouvé pour RuinedFooocus');
      return false;
    }

    console.log('RuinedFooocus Proxy: Module RuinedFooocus visible dans /encours pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('RuinedFooocus Proxy: Erreur vérification module /encours:', error);
    return false;
  }
}

// Fonction pour incrémenter le compteur d'utilisation RuinedFooocus
async function incrementRuinedFooocusUsageCount(userId: string): Promise<void> {
  try {
    console.log('RuinedFooocus Proxy: Incrémentation du compteur d\'utilisation pour:', userId);
    
    // Trouver l'accès au module RuinedFooocus
    const { data: moduleAccess, error: findError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.ruinedfooocus,module_title.ilike.%ruinedfooocus%')
      .single();

    if (findError || !moduleAccess) {
      console.log('RuinedFooocus Proxy: Impossible de trouver l\'accès au module pour incrémenter');
      return;
    }

    // Note: Les quotas sont gérés par le système existant, on incrémente juste le compteur

    // Incrémenter le compteur
    const { error: updateError } = await supabase
      .from('user_applications')
      .update({ 
        usage_count: moduleAccess.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleAccess.id);

    if (updateError) {
      console.error('RuinedFooocus Proxy: Erreur lors de l\'incrémentation:', updateError);
    } else {
      console.log('RuinedFooocus Proxy: Compteur d\'utilisation incrémenté avec succès');
    }
  } catch (error) {
    console.error('RuinedFooocus Proxy: Erreur incrémentation compteur:', error);
  }
}

// Fonction pour gérer le proxy ComfyUI
async function handleComfyUIProxy(request: NextRequest) {
  try {
    console.log('ComfyUI Proxy: Début de la vérification');
    
    // Vérifier s'il y a un token dans les paramètres de requête
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('ComfyUI Proxy: Token trouvé, vérification du token temporaire');
      
      // Vérifier le token avec le système d'autorisation
      const authorizationService = AuthorizationService.getInstance();
      const validationResult = await authorizationService.validateAccessToken(token);
      
      if (!validationResult.valid) {
        console.log('ComfyUI Proxy: Token invalide - redirection vers login:', validationResult.reason);
        return NextResponse.redirect('https://iahome.fr/login', 302);
      }
      
      console.log('ComfyUI Proxy: Token validé avec succès pour:', validationResult.userInfo?.userEmail);
      
      // Rediriger vers ComfyUI (URL de production)
      console.log('ComfyUI Proxy: Redirection vers ComfyUI');
      return NextResponse.redirect('https://comfyui.iahome.fr', 302);
    }
    
    // Si pas de token, vérifier l'origine de la requête (accès direct bloqué)
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('ComfyUI Proxy: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('ComfyUI Proxy: Accès direct bloqué - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('ComfyUI Proxy: Aucun cookie trouvé - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
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
    
    if (error) {
      console.error('ComfyUI Proxy: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    if (!session) {
      console.log('ComfyUI Proxy: Aucune session trouvée - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier si le module apparaît dans /encours (vérification principale)
    const isModuleInEncours = await checkComfyUIModuleInEncours(session.user.id);
    
    if (!isModuleInEncours) {
      console.log('ComfyUI Proxy: Module ComfyUI non visible dans /encours pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier que l'utilisateur a un accès de base au module (sans vérifier quotas)
    const hasBasicAccess = await checkBasicComfyUIAccess(session.user.id);
    
    if (!hasBasicAccess) {
      console.log('ComfyUI Proxy: Aucun accès ComfyUI trouvé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }
    
    console.log('ComfyUI Proxy: Accès autorisé pour utilisateur:', session.user.email);
    
    // Incrémenter le compteur d'utilisation (le système existant gère les quotas)
    await incrementComfyUIUsageCount(session.user.id);
    
    // Rediriger directement vers ComfyUI
    console.log('ComfyUI Proxy: Redirection vers ComfyUI');
    return NextResponse.redirect('https://comfyui.iahome.fr', 302);

  } catch (error) {
    console.error('ComfyUI Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour vérifier l'accès de base au module ComfyUI (sans vérifier quotas)
async function checkBasicComfyUIAccess(userId: string): Promise<boolean> {
  try {
    console.log('ComfyUI Proxy: Vérification accès de base pour utilisateur:', userId);
    
    // Récupérer l'accès au module ComfyUI depuis user_applications
    const { data: moduleAccess, error: accessError } = await supabase
      .from('user_applications')
      .select(`
        id,
        user_id,
        module_id,
        module_title,
        is_active
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.comfyui,module_title.ilike.%comfyui%')
      .single();

    if (accessError || !moduleAccess) {
      console.log('ComfyUI Proxy: Aucun accès ComfyUI trouvé pour l\'utilisateur');
      return false;
    }

    console.log('ComfyUI Proxy: Accès ComfyUI de base trouvé pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('ComfyUI Proxy: Erreur vérification accès de base:', error);
    return false;
  }
}

// Fonction pour vérifier si le module ComfyUI apparaît dans /encours
async function checkComfyUIModuleInEncours(userId: string): Promise<boolean> {
  try {
    console.log('ComfyUI Proxy: Vérification module dans /encours pour utilisateur:', userId);
    
    // Vérifier que le module ComfyUI existe et est visible
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, category, price, is_visible')
      .or('id.eq.comfyui,title.ilike.%comfyui%')
      .single();

    if (moduleError || !moduleData) {
      console.log('ComfyUI Proxy: Module ComfyUI non trouvé dans la base de données');
      return false;
    }

    // Vérifier que le module est visible (apparaît dans /encours)
    if (moduleData.is_visible === false) {
      console.log('ComfyUI Proxy: Module ComfyUI masqué dans /encours');
      return false;
    }

    // Vérifier que l'utilisateur a un accès actif au module (sans vérifier expiration)
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, module_title')
      .eq('user_id', userId)
      .eq('module_id', moduleData.id)
      .eq('is_active', true)
      .single();

    if (accessError || !userAccess) {
      console.log('ComfyUI Proxy: Aucun accès utilisateur trouvé pour ComfyUI');
      return false;
    }

    console.log('ComfyUI Proxy: Module ComfyUI visible dans /encours pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('ComfyUI Proxy: Erreur vérification module /encours:', error);
    return false;
  }
}

// Fonction pour incrémenter le compteur d'utilisation ComfyUI
async function incrementComfyUIUsageCount(userId: string): Promise<void> {
  try {
    console.log('ComfyUI Proxy: Incrémentation du compteur d\'utilisation pour:', userId);
    
    // Trouver l'accès au module ComfyUI
    const { data: moduleAccess, error: findError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.comfyui,module_title.ilike.%comfyui%')
      .single();

    if (findError || !moduleAccess) {
      console.log('ComfyUI Proxy: Impossible de trouver l\'accès au module pour incrémenter');
      return;
    }

    // Note: Les quotas sont gérés par le système existant, on incrémente juste le compteur

    // Incrémenter le compteur
    const { error: updateError } = await supabase
      .from('user_applications')
      .update({ 
        usage_count: moduleAccess.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleAccess.id);

    if (updateError) {
      console.error('ComfyUI Proxy: Erreur lors de l\'incrémentation:', updateError);
    } else {
      console.log('ComfyUI Proxy: Compteur d\'utilisation incrémenté avec succès');
    }
  } catch (error) {
    console.error('ComfyUI Proxy: Erreur incrémentation compteur:', error);
  }
}

// Fonction pour gérer le proxy SDNext
async function handleSDNextProxy(request: NextRequest) {
  try {
    console.log('SDNext Proxy: Début de la vérification');
    
    // Vérifier s'il y a un token dans les paramètres de requête
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('SDNext Proxy: Token trouvé, vérification du token temporaire');
      
      // Vérifier le token avec le système d'autorisation
      const authorizationService = AuthorizationService.getInstance();
      const validationResult = await authorizationService.validateAccessToken(token);
      
      if (!validationResult.valid) {
        console.log('SDNext Proxy: Token invalide - redirection vers login:', validationResult.reason);
        return NextResponse.redirect('https://iahome.fr/login', 302);
      }
      
      console.log('SDNext Proxy: Token validé avec succès pour:', validationResult.userInfo?.userEmail);
      
      // Rediriger vers SDNext (URL de production)
      console.log('SDNext Proxy: Redirection vers SDNext');
      return NextResponse.redirect('https://sdnext.iahome.fr', 302);
    }
    
    // Si pas de token, vérifier l'origine de la requête (accès direct bloqué)
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('SDNext Proxy: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('SDNext Proxy: Accès direct bloqué - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('SDNext Proxy: Aucun cookie trouvé - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
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
    
    if (error) {
      console.error('SDNext Proxy: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    if (!session) {
      console.log('SDNext Proxy: Aucune session trouvée - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier si le module apparaît dans /encours (vérification principale)
    const isModuleInEncours = await checkSDNextModuleInEncours(session.user.id);
    
    if (!isModuleInEncours) {
      console.log('SDNext Proxy: Module SDNext non visible dans /encours pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier que l'utilisateur a un accès de base au module (sans vérifier quotas)
    const hasBasicAccess = await checkBasicSDNextAccess(session.user.id);
    
    if (!hasBasicAccess) {
      console.log('SDNext Proxy: Aucun accès SDNext trouvé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }
    
    console.log('SDNext Proxy: Accès autorisé pour utilisateur:', session.user.email);
    
    // Incrémenter le compteur d'utilisation (le système existant gère les quotas)
    await incrementSDNextUsageCount(session.user.id);
    
    // Rediriger directement vers SDNext
    console.log('SDNext Proxy: Redirection vers SDNext');
    return NextResponse.redirect('https://sdnext.iahome.fr', 302);

  } catch (error) {
    console.error('SDNext Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour vérifier l'accès de base au module SDNext (sans vérifier quotas)
async function checkBasicSDNextAccess(userId: string): Promise<boolean> {
  try {
    console.log('SDNext Proxy: Vérification accès de base pour utilisateur:', userId);
    
    // Récupérer l'accès au module SDNext depuis user_applications
    const { data: moduleAccess, error: accessError } = await supabase
      .from('user_applications')
      .select(`
        id,
        user_id,
        module_id,
        module_title,
        is_active
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.sdnext,module_title.ilike.%sdnext%')
      .single();

    if (accessError || !moduleAccess) {
      console.log('SDNext Proxy: Aucun accès SDNext trouvé pour l\'utilisateur');
      return false;
    }

    console.log('SDNext Proxy: Accès SDNext de base trouvé pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('SDNext Proxy: Erreur vérification accès de base:', error);
    return false;
  }
}

// Fonction pour vérifier si le module SDNext apparaît dans /encours
async function checkSDNextModuleInEncours(userId: string): Promise<boolean> {
  try {
    console.log('SDNext Proxy: Vérification module dans /encours pour utilisateur:', userId);
    
    // Vérifier que le module SDNext existe et est visible
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, category, price, is_visible')
      .or('id.eq.sdnext,title.ilike.%sdnext%')
      .single();

    if (moduleError || !moduleData) {
      console.log('SDNext Proxy: Module SDNext non trouvé dans la base de données');
      return false;
    }

    // Vérifier que le module est visible (apparaît dans /encours)
    if (moduleData.is_visible === false) {
      console.log('SDNext Proxy: Module SDNext masqué dans /encours');
      return false;
    }

    // Vérifier que l'utilisateur a un accès actif au module (sans vérifier expiration)
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, module_title')
      .eq('user_id', userId)
      .eq('module_id', moduleData.id)
      .eq('is_active', true)
      .single();

    if (accessError || !userAccess) {
      console.log('SDNext Proxy: Aucun accès utilisateur trouvé pour SDNext');
      return false;
    }

    console.log('SDNext Proxy: Module SDNext visible dans /encours pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('SDNext Proxy: Erreur vérification module /encours:', error);
    return false;
  }
}

// Fonction pour incrémenter le compteur d'utilisation SDNext
async function incrementSDNextUsageCount(userId: string): Promise<void> {
  try {
    console.log('SDNext Proxy: Incrémentation du compteur d\'utilisation pour:', userId);
    
    // Trouver l'accès au module SDNext
    const { data: moduleAccess, error: findError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.sdnext,module_title.ilike.%sdnext%')
      .single();

    if (findError || !moduleAccess) {
      console.log('SDNext Proxy: Impossible de trouver l\'accès au module pour incrémenter');
      return;
    }

    // Note: Les quotas sont gérés par le système existant, on incrémente juste le compteur

    // Incrémenter le compteur
    const { error: updateError } = await supabase
      .from('user_applications')
      .update({ 
        usage_count: moduleAccess.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleAccess.id);

    if (updateError) {
      console.error('SDNext Proxy: Erreur lors de l\'incrémentation:', updateError);
    } else {
      console.log('SDNext Proxy: Compteur d\'utilisation incrémenté avec succès');
    }
  } catch (error) {
    console.error('SDNext Proxy: Erreur incrémentation compteur:', error);
  }
}

// Fonction pour gérer le proxy Invoke
async function handleInvokeProxy(request: NextRequest) {
  try {
    console.log('Invoke Proxy: Début de la vérification');
    
    // Vérifier s'il y a un token dans les paramètres de requête
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('Invoke Proxy: Token trouvé, vérification du token temporaire');
      
      // Vérifier le token avec le système d'autorisation
      const authorizationService = AuthorizationService.getInstance();
      const validationResult = await authorizationService.validateAccessToken(token);
      
      if (!validationResult.valid) {
        console.log('Invoke Proxy: Token invalide - redirection vers login:', validationResult.reason);
        return NextResponse.redirect('https://iahome.fr/login', 302);
      }
      
      console.log('Invoke Proxy: Token validé avec succès pour:', validationResult.userInfo?.userEmail);
      
      // Rediriger vers Invoke (URL de production)
      console.log('Invoke Proxy: Redirection vers Invoke');
      return NextResponse.redirect('https://invoke.iahome.fr', 302);
    }
    
    // Si pas de token, vérifier l'origine de la requête (accès direct bloqué)
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('Invoke Proxy: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('Invoke Proxy: Accès direct bloqué - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('Invoke Proxy: Aucun cookie trouvé - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
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
    
    if (error) {
      console.error('Invoke Proxy: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    if (!session) {
      console.log('Invoke Proxy: Aucune session trouvée - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier si le module apparaît dans /encours (vérification principale)
    const isModuleInEncours = await checkInvokeModuleInEncours(session.user.id);
    
    if (!isModuleInEncours) {
      console.log('Invoke Proxy: Module Invoke non visible dans /encours pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier que l'utilisateur a un accès de base au module (sans vérifier quotas)
    const hasBasicAccess = await checkBasicInvokeAccess(session.user.id);
    
    if (!hasBasicAccess) {
      console.log('Invoke Proxy: Aucun accès Invoke trouvé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }
    
    console.log('Invoke Proxy: Accès autorisé pour utilisateur:', session.user.email);
    
    // Incrémenter le compteur d'utilisation (le système existant gère les quotas)
    await incrementInvokeUsageCount(session.user.id);
    
    // Rediriger directement vers Invoke
    console.log('Invoke Proxy: Redirection vers Invoke');
    return NextResponse.redirect('https://invoke.iahome.fr', 302);

  } catch (error) {
    console.error('Invoke Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour vérifier l'accès de base au module Invoke (sans vérifier quotas)
async function checkBasicInvokeAccess(userId: string): Promise<boolean> {
  try {
    console.log('Invoke Proxy: Vérification accès de base pour utilisateur:', userId);
    
    // Récupérer l'accès au module Invoke depuis user_applications
    const { data: moduleAccess, error: accessError } = await supabase
      .from('user_applications')
      .select(`
        id,
        user_id,
        module_id,
        module_title,
        is_active
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.invoke,module_title.ilike.%invoke%')
      .single();

    if (accessError || !moduleAccess) {
      console.log('Invoke Proxy: Aucun accès Invoke trouvé pour l\'utilisateur');
      return false;
    }

    console.log('Invoke Proxy: Accès Invoke de base trouvé pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('Invoke Proxy: Erreur vérification accès de base:', error);
    return false;
  }
}

// Fonction pour vérifier si le module Invoke apparaît dans /encours
async function checkInvokeModuleInEncours(userId: string): Promise<boolean> {
  try {
    console.log('Invoke Proxy: Vérification module dans /encours pour utilisateur:', userId);
    
    // Vérifier que le module Invoke existe et est visible
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, category, price, is_visible')
      .or('id.eq.invoke,title.ilike.%invoke%')
      .single();

    if (moduleError || !moduleData) {
      console.log('Invoke Proxy: Module Invoke non trouvé dans la base de données');
      return false;
    }

    // Vérifier que le module est visible (apparaît dans /encours)
    if (moduleData.is_visible === false) {
      console.log('Invoke Proxy: Module Invoke masqué dans /encours');
      return false;
    }

    // Vérifier que l'utilisateur a un accès actif au module (sans vérifier expiration)
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, module_title')
      .eq('user_id', userId)
      .eq('module_id', moduleData.id)
      .eq('is_active', true)
      .single();

    if (accessError || !userAccess) {
      console.log('Invoke Proxy: Aucun accès utilisateur trouvé pour Invoke');
      return false;
    }

    console.log('Invoke Proxy: Module Invoke visible dans /encours pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('Invoke Proxy: Erreur vérification module /encours:', error);
    return false;
  }
}

// Fonction pour incrémenter le compteur d'utilisation Invoke
async function incrementInvokeUsageCount(userId: string): Promise<void> {
  try {
    console.log('Invoke Proxy: Incrémentation du compteur d\'utilisation pour:', userId);
    
    // Trouver l'accès au module Invoke
    const { data: moduleAccess, error: findError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.invoke,module_title.ilike.%invoke%')
      .single();

    if (findError || !moduleAccess) {
      console.log('Invoke Proxy: Impossible de trouver l\'accès au module pour incrémenter');
      return;
    }

    // Note: Les quotas sont gérés par le système existant, on incrémente juste le compteur

    // Incrémenter le compteur
    const { error: updateError } = await supabase
      .from('user_applications')
      .update({ 
        usage_count: moduleAccess.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleAccess.id);

    if (updateError) {
      console.error('Invoke Proxy: Erreur lors de l\'incrémentation:', updateError);
    } else {
      console.log('Invoke Proxy: Compteur d\'utilisation incrémenté avec succès');
    }
  } catch (error) {
    console.error('Invoke Proxy: Erreur incrémentation compteur:', error);
  }
}

// Fonction pour gérer le proxy QR Codes
async function handleQRCodesProxy(request: NextRequest) {
  try {
    console.log('QR Codes Proxy: Début de la vérification');
    
    // Vérifier s'il y a un token dans les paramètres de requête
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('QR Codes Proxy: Token trouvé, vérification du token temporaire');
      
      // Vérifier le token avec le système d'autorisation
      const authorizationService = AuthorizationService.getInstance();
      const validationResult = await authorizationService.validateAccessToken(token);
      
      if (!validationResult.valid) {
        console.log('QR Codes Proxy: Token invalide - redirection vers login:', validationResult.reason);
        return NextResponse.redirect('https://iahome.fr/login', 302);
      }
      
      console.log('QR Codes Proxy: Token validé avec succès pour:', validationResult.userInfo?.userEmail);
      
      // Rediriger vers QR Codes avec le token d'authentification
      console.log('QR Codes Proxy: Redirection vers QR Codes avec token');
      return NextResponse.redirect(`https://qrcodes.iahome.fr?auth_token=${token}`, 302);
    }
    
    // Si pas de token, vérifier l'origine de la requête (accès direct bloqué)
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('QR Codes Proxy: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('QR Codes Proxy: Accès direct bloqué - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('QR Codes Proxy: Aucun cookie trouvé - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
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
    
    if (error) {
      console.error('QR Codes Proxy: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    if (!session) {
      console.log('QR Codes Proxy: Aucune session trouvée - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier si le module apparaît dans /encours (vérification principale)
    const isModuleInEncours = await checkQRCodesModuleInEncours(session.user.id);
    
    if (!isModuleInEncours) {
      console.log('QR Codes Proxy: Module QR Codes non visible dans /encours pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier que l'utilisateur a un accès de base au module (sans vérifier quotas)
    const hasBasicAccess = await checkBasicQRCodesAccess(session.user.id);
    
    if (!hasBasicAccess) {
      console.log('QR Codes Proxy: Aucun accès QR Codes trouvé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }
    
    console.log('QR Codes Proxy: Accès autorisé pour utilisateur:', session.user.email);
    
    // Incrémenter le compteur d'utilisation (le système existant gère les quotas)
    await incrementQRCodesUsageCount(session.user.id);
    
    // Générer un token temporaire pour l'authentification
    const authorizationService = AuthorizationService.getInstance();
    const accessInfo = {
      userId: session.user.id,
      userEmail: session.user.email || '',
      moduleId: 'qrcodes',
      moduleTitle: 'QR Codes'
    };
    const qrToken = await authorizationService.generateAccessToken(accessInfo, 5);
    
    if (!qrToken) {
      console.error('QR Codes Proxy: Erreur génération token');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }
    
    // Rediriger vers QR Codes avec le token d'authentification
    console.log('QR Codes Proxy: Redirection vers QR Codes avec token');
    return NextResponse.redirect(`https://qrcodes.iahome.fr?auth_token=${qrToken}`, 302);

  } catch (error) {
    console.error('QR Codes Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour vérifier l'accès de base au module QR Codes (sans vérifier quotas)
async function checkBasicQRCodesAccess(userId: string): Promise<boolean> {
  try {
    console.log('QR Codes Proxy: Vérification accès de base pour utilisateur:', userId);
    
    // Récupérer l'accès au module QR Codes depuis user_applications
    const { data: moduleAccess, error: accessError } = await supabase
      .from('user_applications')
      .select(`
        id,
        user_id,
        module_id,
        module_title,
        is_active
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.qrcodes,module_title.ilike.%qrcodes%,module_title.ilike.%qr codes%')
      .single();

    if (accessError || !moduleAccess) {
      console.log('QR Codes Proxy: Aucun accès QR Codes trouvé pour l\'utilisateur');
      return false;
    }

    console.log('QR Codes Proxy: Accès QR Codes de base trouvé pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('QR Codes Proxy: Erreur vérification accès de base:', error);
    return false;
  }
}

// Fonction pour vérifier si le module QR Codes apparaît dans /encours
async function checkQRCodesModuleInEncours(userId: string): Promise<boolean> {
  try {
    console.log('QR Codes Proxy: Vérification module dans /encours pour utilisateur:', userId);
    
    // Vérifier que le module QR Codes existe et est visible
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, category, price, is_visible')
      .or('id.eq.qrcodes,title.ilike.%qrcodes%,title.ilike.%qr codes%')
      .single();

    if (moduleError || !moduleData) {
      console.log('QR Codes Proxy: Module QR Codes non trouvé dans la base de données');
      return false;
    }

    // Vérifier que le module est visible (apparaît dans /encours)
    if (moduleData.is_visible === false) {
      console.log('QR Codes Proxy: Module QR Codes masqué dans /encours');
      return false;
    }

    // Vérifier que l'utilisateur a un accès actif au module (sans vérifier expiration)
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, is_active, module_title')
      .eq('user_id', userId)
      .eq('module_id', moduleData.id)
      .eq('is_active', true)
      .single();

    if (accessError || !userAccess) {
      console.log('QR Codes Proxy: Aucun accès utilisateur trouvé pour QR Codes');
      return false;
    }

    console.log('QR Codes Proxy: Module QR Codes visible dans /encours pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('QR Codes Proxy: Erreur vérification module /encours:', error);
    return false;
  }
}

// Fonction pour incrémenter le compteur d'utilisation QR Codes
async function incrementQRCodesUsageCount(userId: string): Promise<void> {
  try {
    console.log('QR Codes Proxy: Incrémentation du compteur d\'utilisation pour:', userId);
    
    // Trouver l'accès au module QR Codes
    const { data: moduleAccess, error: findError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('module_id.eq.qrcodes,module_title.ilike.%qrcodes%,module_title.ilike.%qr codes%')
      .single();

    if (findError || !moduleAccess) {
      console.log('QR Codes Proxy: Impossible de trouver l\'accès au module pour incrémenter');
      return;
    }

    // Note: Les quotas sont gérés par le système existant, on incrémente juste le compteur

    // Incrémenter le compteur
    const { error: updateError } = await supabase
      .from('user_applications')
      .update({ 
        usage_count: moduleAccess.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleAccess.id);

    if (updateError) {
      console.error('QR Codes Proxy: Erreur lors de l\'incrémentation:', updateError);
    } else {
      console.log('QR Codes Proxy: Compteur d\'utilisation incrémenté avec succès');
    }
  } catch (error) {
    console.error('QR Codes Proxy: Erreur incrémentation compteur:', error);
  }
}

// Fonction pour vérifier un token temporaire LibreSpeed
async function verifyTemporaryToken(token: string) {
  try {
    console.log('LibreSpeed Proxy: Vérification du token temporaire:', token);

    const authorizationService = AuthorizationService.getInstance();
    const validationResult = await authorizationService.validateAccessToken(token);

    if (!validationResult.valid) {
      console.log('LibreSpeed Proxy: Token invalide - redirection vers login:', validationResult.reason);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    console.log('LibreSpeed Proxy: Token validé avec succès pour:', validationResult.userInfo?.userEmail);
    
    // Rediriger vers LibreSpeed
    console.log('LibreSpeed Proxy: Redirection vers LibreSpeed');
    return NextResponse.redirect('https://librespeed.iahome.fr', 302);

  } catch (error) {
    console.error('LibreSpeed Proxy: Erreur vérification token temporaire:', error);
    return NextResponse.redirect('https://iahome.fr/encours?error=token_verification_failed', 302);
  }
}

// Fonction pour proxifier vers LibreSpeed
async function proxyToLibreSpeed(request: NextRequest, token?: string) {
  try {
    const url = new URL(request.url);
    const targetUrl = `http://librespeed:80${url.pathname}${url.search}`;
    
    console.log('LibreSpeed Proxy: Proxification vers:', targetUrl);
    
    // Créer la requête vers LibreSpeed
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Ajouter le token si fourni
    if (token) {
      proxyRequest.headers.set('X-LibreSpeed-Token', token);
    }
    
    // Faire la requête vers LibreSpeed
    const response = await fetch(proxyRequest);
    
    // Créer la réponse avec les headers appropriés
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('X-Proxy-Source', 'iahome-librespeed-proxy');
    
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('LibreSpeed Proxy Error:', error);
    return new NextResponse('Proxy Error', { status: 500 });
  }
}
