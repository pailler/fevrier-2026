import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Générer un token d'accès temporaire pour LibreSpeed
export async function POST(request: NextRequest) {
  try {
    console.log('LibreSpeed Token: Génération d\'un token d\'accès temporaire');
    
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
      console.log('LibreSpeed Token: Aucun cookie trouvé');
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
      console.error('LibreSpeed Token: Erreur lors de la vérification de la session:', error);
      return new NextResponse('Unauthorized - Session error', { 
        status: 401,
        headers: corsHeaders
      });
    }

    if (!session) {
      console.log('LibreSpeed Token: Aucune session trouvée');
      return new NextResponse('Unauthorized - No session', { 
        status: 401,
        headers: corsHeaders
      });
    }

    // Vérifier que l'utilisateur a accès au module LibreSpeed (juste vérifier qu'il existe dans user_applications)
    console.log('LibreSpeed Token: Vérification accès pour utilisateur:', session.user.id, session.user.email);
    const hasAccess = await checkBasicLibreSpeedAccess(session.user.id);
    
    if (!hasAccess) {
      console.log('LibreSpeed Token: Aucun accès LibreSpeed trouvé pour:', session.user.email);
      return new NextResponse('Forbidden - No LibreSpeed access', { 
        status: 403,
        headers: corsHeaders
      });
    }
    
    console.log('LibreSpeed Token: Accès LibreSpeed confirmé, génération du token...');

    // Générer un token temporaire (valide 5 minutes)
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Stocker le token en base de données
    console.log('LibreSpeed Token: Insertion du token en base de données...');
    const { error: insertError } = await supabase
      .from('librespeed_tokens')
      .insert([{
        token: token,
        user_id: session.user.id,
        user_email: session.user.email,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        is_used: false
      }]);

    if (insertError) {
      console.error('LibreSpeed Token: Erreur lors de l\'insertion du token:', insertError);
      
      // Si la table n'existe pas, retourner une erreur spécifique
      if (insertError.message?.includes('relation "librespeed_tokens" does not exist')) {
        console.error('LibreSpeed Token: Table librespeed_tokens n\'existe pas. Veuillez exécuter le script SQL.');
        return new NextResponse('Table not created - Please run SQL script', { 
          status: 500,
          headers: corsHeaders
        });
      }
      
      return new NextResponse('Internal Server Error', { 
        status: 500,
        headers: corsHeaders
      });
    }

    console.log('LibreSpeed Token: Token généré avec succès pour:', session.user.email);

    return NextResponse.json({
      success: true,
      token: token,
      expires_at: expiresAt.toISOString(),
      message: 'Token d\'accès temporaire généré avec succès'
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('LibreSpeed Token Error:', error);
    return new NextResponse('Internal Server Error', { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Cookie',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }
}

// Gérer les requêtes OPTIONS pour CORS
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

    console.log('LibreSpeed Token: Vérification du token:', token);

    // Vérifier le token en base de données
    const { data: tokenData, error } = await supabase
      .from('librespeed_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_used', false)
      .single();

    if (error || !tokenData) {
      console.log('LibreSpeed Token: Token invalide ou non trouvé');
      return new NextResponse('Unauthorized - Invalid token', { status: 401 });
    }

    // Vérifier si le token n'a pas expiré
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      console.log('LibreSpeed Token: Token expiré');
      return new NextResponse('Unauthorized - Token expired', { status: 401 });
    }

    // Marquer le token comme utilisé
    await supabase
      .from('librespeed_tokens')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    console.log('LibreSpeed Token: Token validé avec succès pour:', tokenData.user_email);

    return NextResponse.json({
      success: true,
      user_id: tokenData.user_id,
      user_email: tokenData.user_email,
      message: 'Token validé avec succès'
    });

  } catch (error) {
    console.error('LibreSpeed Token Verification Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fonction pour vérifier l'accès de base au module LibreSpeed (sans vérifier quotas)
async function checkBasicLibreSpeedAccess(userId: string): Promise<boolean> {
  try {
    console.log('LibreSpeed Token: Vérification accès de base LibreSpeed pour utilisateur:', userId);
    
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
      console.log('LibreSpeed Token: Aucun accès LibreSpeed trouvé pour l\'utilisateur');
      return false;
    }

    console.log('LibreSpeed Token: Accès LibreSpeed de base trouvé pour l\'utilisateur');
    return true;
  } catch (error) {
    console.error('LibreSpeed Token: Erreur vérification accès de base:', error);
    return false;
  }
}
