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
    
    // Vérifier si c'est une requête de proxy LibreSpeed
    const host = request.headers.get('host');
    const isLibreSpeedProxy = host?.includes('librespeed.iahome.fr');
    
    if (isLibreSpeedProxy) {
      return handleLibreSpeedProxy(request);
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
    
    // Vérifier s'il y a un token dans les paramètres de requête
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('LibreSpeed Proxy: Token trouvé, vérification du token temporaire');
      
      // Vérifier le token avec le système d'autorisation
      const authorizationService = AuthorizationService.getInstance();
      const validationResult = await authorizationService.validateAccessToken(token);
      
      if (!validationResult.valid) {
        console.log('LibreSpeed Proxy: Token invalide - redirection vers login:', validationResult.reason);
        return NextResponse.redirect('https://iahome.fr/login', 302);
      }
      
      console.log('LibreSpeed Proxy: Token validé avec succès pour:', validationResult.userInfo?.userEmail);
      
      // Rediriger vers LibreSpeed (URL de production)
      console.log('LibreSpeed Proxy: Redirection vers LibreSpeed');
      return NextResponse.redirect('https://librespeed.iahome.fr', 302);
    }
    
    // Si pas de token, vérifier l'origine de la requête (accès direct bloqué)
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('LibreSpeed Proxy: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('LibreSpeed Proxy: Accès direct bloqué - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('LibreSpeed Proxy: Aucun cookie trouvé - redirection vers login');
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
      console.error('LibreSpeed Proxy: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    if (!session) {
      console.log('LibreSpeed Proxy: Aucune session trouvée - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier si le module apparaît dans /encours (vérification principale)
    const isModuleInEncours = await checkModuleInEncours(session.user.id);
    
    if (!isModuleInEncours) {
      console.log('LibreSpeed Proxy: Module LibreSpeed non visible dans /encours pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier que l'utilisateur a un accès de base au module (sans vérifier quotas)
    const hasBasicAccess = await checkBasicModuleAccess(session.user.id);
    
    if (!hasBasicAccess) {
      console.log('LibreSpeed Proxy: Aucun accès LibreSpeed trouvé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }
    
    console.log('LibreSpeed Proxy: Accès autorisé pour utilisateur:', session.user.email);
    
    // Incrémenter le compteur d'utilisation (le système existant gère les quotas)
    await incrementUsageCount(session.user.id);
    
    // Rediriger directement vers LibreSpeed
    console.log('LibreSpeed Proxy: Redirection vers LibreSpeed');
    return NextResponse.redirect('https://librespeed.iahome.fr', 302);

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
