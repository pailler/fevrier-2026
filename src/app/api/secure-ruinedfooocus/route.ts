import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase avec valeurs par défaut
const DEFAULT_SUPABASE_URL = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const DEFAULT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

function getEnvVar(key: string, defaultValue: string): string {
  try {
    const value = process.env[key];
    if (!value || value === 'undefined' || value === 'null' || value.trim() === '') {
      return defaultValue;
    }
    return value;
  } catch (error) {
    return defaultValue;
  }
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', DEFAULT_SUPABASE_URL);
const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY', DEFAULT_SERVICE_ROLE_KEY);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// URL de l'application RuinedFooocus
const RUINEDFOOOCUS_URL = 'https://da4be546aab3e23055.gradio.live/';

// IPs autorisées (votre réseau)
const ALLOWED_IPS = [
  '90.90.226.59', // Votre IP principale
  '127.0.0.1',    // Localhost
  '::1',          // IPv6 localhost
  'localhost'     // Localhost
];

// Vérifier l'accès utilisateur
async function checkUserAccess(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('module_access')
      .select('*')
      .eq('user_id', userId)
      .eq('modules.title', 'RuinedFooocus')
      .single();

    if (error || !data) {
      return false;
    }

    // Vérifier si l'accès n'a pas expiré
    if (data.expires_at) {
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      if (expiresAt <= now) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'IP du client
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') ||
                    'unknown';
    
    // Vérifier si l'IP est autorisée
    const isIPAllowed = ALLOWED_IPS.includes(clientIP);
    
    if (!isIPAllowed) {
      // Rediriger vers la page d'accès refusé
      const errorUrl = new URL('/access-denied', request.url);
      errorUrl.searchParams.set('reason', 'ip_restricted');
      errorUrl.searchParams.set('requested_path', '/api/secure-ruinedfooocus');
      
      return NextResponse.redirect(errorUrl);
    }
    
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    
    // Vérifier le token avec Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }
    
    // Vérifier l'accès utilisateur à RuinedFooocus
    const hasAccess = await checkUserAccess(user.id);
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Accès non autorisé à RuinedFooocus' },
        { status: 403 }
      );
    }
    
    // Rediriger vers l'application RuinedFooocus
    return NextResponse.redirect(RUINEDFOOOCUS_URL);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Même logique de vérification que pour GET
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') ||
                    'unknown';
    
    // Vérifier si l'IP est autorisée
    const isIPAllowed = ALLOWED_IPS.includes(clientIP);
    
    if (!isIPAllowed) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }
    
    // Vérifier l'accès utilisateur
    const hasAccess = await checkUserAccess(user.id);
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Accès non autorisé à RuinedFooocus' },
        { status: 403 }
      );
    }
    
    // Récupérer le body de la requête
    const body = await request.text();
    
    // Transférer la requête vers RuinedFooocus
    const response = await fetch(RUINEDFOOOCUS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'User-Agent': request.headers.get('user-agent') || '',
      },
      body: body,
    });
    
    // Retourner la réponse
    const responseData = await response.text();
    
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

