import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('Converter Token: Génération d\'un token d\'accès temporaire');
    
    // Headers CORS pour permettre les requêtes avec credentials
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    };
    
    // Récupérer les cookies de la requête
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('Converter Token: Aucun cookie trouvé');
      return new NextResponse('Unauthorized - No cookies', { 
        status: 401,
        headers: corsHeaders
      });
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
      console.error('Converter Token: Erreur lors de la vérification de la session:', error);
      return new NextResponse('Unauthorized - Session error', { 
        status: 401,
        headers: corsHeaders
      });
    }

    if (!session) {
      console.log('Converter Token: Aucune session trouvée');
      return new NextResponse('Unauthorized - No session', { 
        status: 401,
        headers: corsHeaders
      });
    }

    // Vérifier que l'utilisateur a accès au module Converter
    console.log('Converter Token: Vérification accès pour utilisateur:', session.user.id, session.user.email);
    const hasAccess = await checkConverterAccess(session.user.id);
    
    if (!hasAccess) {
      console.log('Converter Token: Aucun accès Converter trouvé pour:', session.user.email);
      return new NextResponse('Forbidden - No Converter access', { 
        status: 403,
        headers: corsHeaders
      });
    }
    
    console.log('Converter Token: Accès Converter confirmé, génération du token...');

    // Générer un token temporaire (valide 10 minutes)
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Stocker le token en base de données
    console.log('Converter Token: Insertion du token en base de données...');
    const { error: insertError } = await supabase
      .from('converter_tokens')
      .insert([{
        token: token,
        user_id: session.user.id,
        user_email: session.user.email,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        is_used: false
      }]);

    if (insertError) {
      console.error('Converter Token: Erreur lors de l\'insertion du token:', insertError);
      return new NextResponse('Internal Server Error - Token creation failed', { 
        status: 500,
        headers: corsHeaders
      });
    }

    console.log('Converter Token: Token généré avec succès:', token);

    // Retourner l'URL avec le token
    const converterUrl = `https://converter.iahome.fr?token=${token}`;
    
    return NextResponse.json({
      success: true,
      token: token,
      url: converterUrl,
      expires_at: expiresAt.toISOString(),
      message: 'Token généré avec succès'
    }, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Converter Token Generation Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

// Vérifier un token d'accès
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new NextResponse('Bad Request - No token provided', { status: 400 });
    }

    console.log('Converter Token: Vérification du token:', token);

    // Vérifier le token en base de données
    const { data: tokenData, error } = await supabase
      .from('converter_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_used', false)
      .single();

    if (error || !tokenData) {
      console.log('Converter Token: Token invalide ou non trouvé');
      return new NextResponse('Unauthorized - Invalid token', { status: 401 });
    }

    // Vérifier si le token n'a pas expiré
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      console.log('Converter Token: Token expiré');
      return new NextResponse('Unauthorized - Token expired', { status: 401 });
    }

    // Marquer le token comme utilisé
    await supabase
      .from('converter_tokens')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    console.log('Converter Token: Token validé avec succès pour:', tokenData.user_email);

    return NextResponse.json({
      success: true,
      user_id: tokenData.user_id,
      user_email: tokenData.user_email,
      message: 'Token validé avec succès'
    });

  } catch (error) {
    console.error('Converter Token Verification Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour vérifier l'accès de base au module Converter
async function checkConverterAccess(userId: string): Promise<boolean> {
  try {
    // Vérifier si l'utilisateur a le module converter dans ses applications
    const { data: userApps, error } = await supabase
      .from('user_applications')
      .select('module_id')
      .eq('user_id', userId)
      .eq('module_id', 'converter')
      .eq('is_active', true);

    if (error) {
      console.error('Converter Token: Erreur lors de la vérification des applications:', error);
      return false;
    }

    // Si l'utilisateur a le module converter ou si c'est un module gratuit
    return userApps && userApps.length > 0;
  } catch (error) {
    console.error('Converter Token: Erreur lors de la vérification de l\'accès:', error);
    return false;
  }
}
