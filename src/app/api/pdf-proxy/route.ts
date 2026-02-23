import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { supabase } from '../../../utils/supabaseClient';
import { TokenActionService } from '../../../utils/tokenActionService';

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'https://pdf.iahome.fr';

export async function GET(request: NextRequest) {
  try {
    console.log('PDF Proxy: Début de la vérification');
    
    // Vérifier s'il y a un token dans les paramètres de requête
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      console.log('PDF Proxy: Token trouvé, vérification du token temporaire');
      
      // Vérifier le token avec l'API pdf-validate-token
      const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/pdf-validate-token?token=${token}`);
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        console.log('PDF Proxy: Token validé avec succès pour:', tokenData.user_email);
        
        // Rediriger vers PDF (URL de production)
        console.log('PDF Proxy: Redirection vers PDF');
        return NextResponse.redirect('https://pdf.iahome.fr', 302);
      } else {
        console.log('PDF Proxy: Token invalide - redirection vers essentiels');
        return NextResponse.redirect('https://iahome.fr/essentiels', 302);
      }
    }
    
    // Si pas de token, vérifier l'origine de la requête (accès direct bloqué)
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    console.log('PDF Proxy: Headers - referer:', referer, 'origin:', origin, 'host:', host);
    
    // Vérifier l'origine de la requête
    if (!referer?.includes('iahome.fr') && !origin?.includes('iahome.fr') && !host?.includes('iahome.fr')) {
      console.log('PDF Proxy: Accès direct bloqué - redirection vers essentiels');
      return NextResponse.redirect('https://iahome.fr/essentiels', 302);
    }

    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('PDF Proxy: Aucun cookie trouvé - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
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
    
    if (error) {
      console.error('PDF Proxy: Erreur lors de la vérification de la session:', error);
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    if (!session) {
      console.log('PDF Proxy: Aucune session trouvée - redirection vers login');
      return NextResponse.redirect('https://iahome.fr/login', 302);
    }

    // Vérifier si le module apparaît dans /account (vérification principale)
    const isModuleInEncours = await checkPdfModuleInEncours(session.user.id);
    
    if (!isModuleInEncours) {
      console.log('PDF Proxy: Module PDF non visible dans /account pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/essentiels', 302);
    }

    // Vérifier que l'utilisateur a un accès de base au module (sans vérifier quotas)
    const hasBasicAccess = await checkBasicPdfAccess(session.user.id);
    
    if (!hasBasicAccess) {
      console.log('PDF Proxy: Aucun accès PDF trouvé pour:', session.user.email);
      return NextResponse.redirect('https://iahome.fr/essentiels', 302);
    }

    // 🪙 Vérification des tokens désactivée temporairement
    console.log('PDF Proxy: Accès autorisé pour:', session.user.email);
    
    console.log('PDF Proxy: Accès autorisé pour utilisateur:', session.user.email);
    
    // Incrémenter le compteur d'utilisation (le système existant gère les quotas)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/increment-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          moduleId: 'pdf',
          moduleTitle: 'PDF'
        })
      });
    } catch (usageError) {
      console.error('PDF Proxy: Erreur lors de l\'incrémentation de l\'usage:', usageError);
      // Ne pas bloquer l'accès pour cette erreur
    }
    
    // Rediriger vers PDF
    console.log('PDF Proxy: Redirection vers PDF');
    return NextResponse.redirect('https://pdf.iahome.fr', 302);

  } catch (error) {
    console.error('PDF Proxy Error:', error);
    return NextResponse.redirect('https://iahome.fr/essentiels', 302);
  }
}

// Fonction pour vérifier si le module PDF est dans /account
async function checkPdfModuleInEncours(userId: string): Promise<boolean> {
  try {
    const { data: userApps, error } = await supabase
      .from('user_applications')
      .select('module_id, module_title')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('PDF Proxy: Erreur lors de la vérification des applications:', error);
      return false;
    }

    // Vérifier si le module pdf est présent
    const hasPdf = userApps?.some(app => 
      app.module_id === 'pdf' || 
      app.module_title?.toLowerCase().includes('pdf')
    );

    console.log('PDF Proxy: Module PDF dans /account:', hasPdf);
    return hasPdf || false;
  } catch (error) {
    console.error('PDF Proxy: Erreur lors de la vérification du module dans /account:', error);
    return false;
  }
}

// Fonction pour vérifier l'accès de base au module PDF
async function checkBasicPdfAccess(userId: string): Promise<boolean> {
  try {
    // Vérifier si l'utilisateur a le module pdf dans ses applications
    const { data: userApps, error } = await supabase
      .from('user_applications')
      .select('module_id')
      .eq('user_id', userId)
      .eq('module_id', 'pdf')
      .eq('is_active', true);

    if (error) {
      console.error('PDF Proxy: Erreur lors de la vérification des applications:', error);
      return false;
    }

    // Si l'utilisateur a le module pdf ou si c'est un module gratuit
    const hasAccess = userApps && userApps.length > 0;
    console.log('PDF Proxy: Accès de base PDF:', hasAccess);
    return hasAccess;
  } catch (error) {
    console.error('PDF Proxy: Erreur lors de la vérification de l\'accès:', error);
    return false;
  }
}
