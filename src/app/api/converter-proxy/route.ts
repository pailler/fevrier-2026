import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('Converter Proxy: Début de la vérification');
    
    // Vérifier s'il y a un token dans les paramètres de requête
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('Converter Proxy: Token trouvé, vérification du token temporaire');
      
      // Vérifier le token avec l'API converter-token
      const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/converter-token?token=${token}`);
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        console.log('Converter Proxy: Token validé avec succès pour:', tokenData.user_email);
        
        // Rediriger vers Universal Converter (URL de production)
        console.log('Converter Proxy: Redirection vers Universal Converter');
        return NextResponse.redirect('https://converter.iahome.fr', 302);
      } else {
        console.log('Converter Proxy: Token invalide - redirection vers login');
        return NextResponse.redirect('https://iahome.fr/essentiels', 302);
      }
    }
    
    // Si pas de token, vérifier l'origine de la requête (accès direct bloqué)
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('Converter Proxy: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('Converter Proxy: Accès direct bloqué - redirection vers essentiels');
      return NextResponse.redirect('https://iahome.fr/essentiels', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('Converter Proxy: Aucun cookie trouvé - redirection vers login');
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
      console.error('Converter Proxy: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    if (!session) {
      console.log('Converter Proxy: Aucune session trouvée - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier si le module apparaît dans /encours (vérification principale)
    const isModuleInEncours = await checkConverterModuleInEncours(session.user.id);
    
    if (!isModuleInEncours) {
      console.log('Converter Proxy: Module Converter non visible dans /encours pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/essentiels', 302);
    }

    // Vérifier que l'utilisateur a un accès de base au module (sans vérifier quotas)
    const hasBasicAccess = await checkBasicConverterAccess(session.user.id);
    
    if (!hasBasicAccess) {
      console.log('Converter Proxy: Aucun accès Converter trouvé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/essentiels', 302);
    }
    
    console.log('Converter Proxy: Accès autorisé pour utilisateur:', session.user.email);
    
    // Incrémenter le compteur d'utilisation (le système existant gère les quotas)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/increment-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          moduleId: 'converter',
          moduleTitle: 'Universal Converter'
        })
      });
    } catch (usageError) {
      console.error('Converter Proxy: Erreur lors de l\'incrémentation de l\'usage:', usageError);
      // Ne pas bloquer l'accès pour cette erreur
    }
    
    // Rediriger vers Universal Converter
    console.log('Converter Proxy: Redirection vers Universal Converter');
    return NextResponse.redirect('https://converter.iahome.fr', 302);

  } catch (error) {
    console.error('Converter Proxy Error:', error);
    return NextResponse.redirect('https://iahome.fr/essentiels', 302);
  }
}

// Fonction pour vérifier si le module Converter est dans /encours
async function checkConverterModuleInEncours(userId: string): Promise<boolean> {
  try {
    const { data: userApps, error } = await supabase
      .from('user_applications')
      .select('module_id, module_title')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Converter Proxy: Erreur lors de la vérification des applications:', error);
      return false;
    }

    // Vérifier si le module converter est présent
    const hasConverter = userApps?.some(app => 
      app.module_id === 'converter' || 
      app.module_title?.toLowerCase().includes('converter') ||
      app.module_title?.toLowerCase().includes('universal')
    );

    console.log('Converter Proxy: Module Converter dans /encours:', hasConverter);
    return hasConverter || false;
  } catch (error) {
    console.error('Converter Proxy: Erreur lors de la vérification du module dans /encours:', error);
    return false;
  }
}

// Fonction pour vérifier l'accès de base au module Converter
async function checkBasicConverterAccess(userId: string): Promise<boolean> {
  try {
    // Vérifier si l'utilisateur a le module converter dans ses applications
    const { data: userApps, error } = await supabase
      .from('user_applications')
      .select('module_id')
      .eq('user_id', userId)
      .eq('module_id', 'converter')
      .eq('is_active', true);

    if (error) {
      console.error('Converter Proxy: Erreur lors de la vérification des applications:', error);
      return false;
    }

    // Si l'utilisateur a le module converter ou si c'est un module gratuit
    const hasAccess = userApps && userApps.length > 0;
    console.log('Converter Proxy: Accès de base Converter:', hasAccess);
    return hasAccess;
  } catch (error) {
    console.error('Converter Proxy: Erreur lors de la vérification de l\'accès:', error);
    return false;
  }
}
