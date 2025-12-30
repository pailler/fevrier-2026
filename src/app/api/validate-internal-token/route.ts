import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'iahome-jwt-secret-2024-production-secure-key';

// Fonction helper pour obtenir les en-têtes CORS
function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = [
    'https://apprendre-autrement.iahome.fr',
    'https://iahome.fr',
    'http://localhost:9001',
    'http://localhost:3000',
  ];

  // Normaliser l'origine (enlever le slash final si présent)
  const normalizedOrigin = origin ? origin.replace(/\/$/, '') : null;

  // Déterminer l'origine à autoriser
  // IMPORTANT: Pour CORS, si on utilise des origines spécifiques, on doit retourner exactement l'origine demandée
  let allowOrigin = '*';
  if (normalizedOrigin) {
    if (allowedOrigins.includes(normalizedOrigin)) {
      allowOrigin = normalizedOrigin;
    } else {
      // Pour les autres origines, autoriser quand même (développement)
      allowOrigin = normalizedOrigin;
    }
  }

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Origin, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false',
  };

  // Ajouter Vary seulement si on utilise des origines spécifiques
  if (allowOrigin !== '*') {
    headers['Vary'] = 'Origin';
  }

  return headers;
}

// Gérer les requêtes OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || request.headers.get('Origin') || '*';
  console.log(`🔍 OPTIONS preflight depuis: ${origin}`);
  
  const corsHeaders = getCorsHeaders(origin);
  
  console.log(`✅ OPTIONS: En-têtes CORS configurés - Origin: ${origin}`);
  return new NextResponse(null, { 
    status: 204,
    headers: corsHeaders
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || request.headers.get('Origin');
  console.log(`🔍 POST validation token depuis: ${origin}`);
  const corsHeaders = getCorsHeaders(origin);
  
  try {
    const { token, moduleId } = await request.json();
    
    if (!token || !moduleId) {
      return NextResponse.json(
        { error: 'Token et moduleId requis' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    console.log(`🔍 Validation token pour module ${moduleId}`);
    console.log(`🔍 Token reçu (premiers 50 caractères): ${token.substring(0, 50)}...`);

    // Décoder le token (essayer JWT d'abord, puis Base64)
    let tokenPayload: any;
    try {
      // Essayer d'abord JWT
      try {
        tokenPayload = jwt.verify(token, JWT_SECRET) as any;
        console.log('✅ Token JWT décodé avec succès');
        console.log('📋 Payload JWT:', JSON.stringify(tokenPayload, null, 2));
      } catch (jwtError: any) {
        console.log('⚠️ Échec décodage JWT, tentative Base64...');
        console.log('⚠️ Erreur JWT:', jwtError.message);
        // Si JWT échoue, essayer Base64 simple
        try {
          const decoded = atob(token);
          tokenPayload = JSON.parse(decoded);
          console.log('✅ Token Base64 décodé avec succès');
          console.log('📋 Payload Base64:', JSON.stringify(tokenPayload, null, 2));
        } catch (base64Error: any) {
          console.error('❌ Erreur décodage token (JWT et Base64 échoués)');
          console.error('❌ Erreur JWT:', jwtError.message);
          console.error('❌ Erreur Base64:', base64Error.message);
          return NextResponse.json(
            { error: 'Token invalide - format non reconnu' },
            { 
              status: 401,
              headers: corsHeaders
            }
          );
        }
      }
    } catch (error: any) {
      console.error('❌ Erreur décodage token:', error);
      console.error('❌ Détails:', error.message, error.stack);
      return NextResponse.json(
        { error: `Erreur décodage token: ${error.message || 'Erreur inconnue'}` },
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    // Vérifier l'expiration (pour JWT: exp est en secondes, pour Base64: expiresAt est en millisecondes)
    const isExpired = tokenPayload.exp 
      ? tokenPayload.exp * 1000 < Date.now()  // JWT: exp en secondes
      : (tokenPayload.expiresAt && tokenPayload.expiresAt < Date.now());  // Base64: expiresAt en millisecondes
    
    if (isExpired) {
      return NextResponse.json(
        { error: 'Token expiré' },
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    // Vérifier que le moduleId correspond
    if (tokenPayload.moduleId !== moduleId) {
      return NextResponse.json(
        { error: 'Token invalide pour ce module' },
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    // Extraire userId (peut être userId ou user_id selon le format du token)
    const userId = tokenPayload.userId || tokenPayload.user_id;
    const userEmail = tokenPayload.userEmail || tokenPayload.user_email || tokenPayload.email;

    if (!userId) {
      return NextResponse.json(
        { error: 'Token invalide: userId manquant' },
        { 
          status: 401,
          headers: corsHeaders
        }
      );
    }

    // Vérifier l'accès au module dans user_applications
    console.log(`🔍 Vérification accès pour userId: ${userId}, moduleId: ${moduleId}`);
    const { data: access, error: accessError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .single();

    if (accessError) {
      console.error('❌ Erreur Supabase:', accessError);
      console.error('❌ Code:', accessError.code, 'Message:', accessError.message);
    }

    if (accessError || !access) {
      console.error('❌ Accès non autorisé - accessError:', accessError, 'access:', access);
      return NextResponse.json(
        { 
          error: 'Accès non autorisé. Activez d\'abord le module.',
          details: accessError ? { code: accessError.code, message: accessError.message } : 'Aucun accès trouvé'
        },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }

    console.log('✅ Accès trouvé:', access.id);

    // Vérifier l'expiration de l'accès
    if (access.expires_at && new Date(access.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Accès expiré' },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }

    console.log(`✅ Token validé pour ${moduleId}, utilisateur: ${userEmail || userId}`);

    return NextResponse.json({
      success: true,
      userId: userId,
      userEmail: userEmail,
      moduleId: moduleId,
      accessId: access.id
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ Erreur validation token interne:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}
