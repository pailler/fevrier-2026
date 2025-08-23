import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sign, verify } from 'jsonwebtoken';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Clé secrète pour les tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Configuration Cursor Remote Access
const CURSOR_CONFIG = {
  localUrl: 'http://localhost:3000', // URL locale de Cursor
  port: 3000,
  allowedOrigins: ['https://iahome.fr', 'https://www.iahome.fr']
};

// Interface pour le token d'accès distant
interface RemoteAccessToken {
  userId: string;
  sessionId: string;
  expiresAt: number;
  ip: string;
  issuedAt: number;
  permissions: string[];
}

// Vérifier l'accès utilisateur
async function checkUserAccess(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('module_access')
      .select('*')
      .eq('user_id', userId)
      .eq('modules.title', 'Cursor Remote Access')
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

// Générer un token d'accès distant
function generateRemoteToken(userId: string, sessionId: string, ip: string): string {
  const tokenData: RemoteAccessToken = {
    userId,
    sessionId,
    expiresAt: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24h
    ip,
    issuedAt: Math.floor(Date.now() / 1000),
    permissions: ['read', 'write', 'execute']
  };

  return sign(tokenData, JWT_SECRET, { expiresIn: '24h' });
}

// Vérifier un token d'accès distant
function verifyRemoteToken(token: string): RemoteAccessToken | null {
  try {
    return verify(token, JWT_SECRET) as RemoteAccessToken;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId } = await request.json();
    
    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'userId et sessionId requis' },
        { status: 400 }
      );
    }

    // Récupérer l'IP du client
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') ||
                    'unknown';

    // Vérifier l'accès utilisateur
    const hasAccess = await checkUserAccess(userId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Générer le token d'accès
    const accessToken = generateRemoteToken(userId, sessionId, clientIP);

    // Enregistrer la session dans la base de données
    await supabase
      .from('remote_sessions')
      .insert({
        user_id: userId,
        session_id: sessionId,
        ip_address: clientIP,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

    return NextResponse.json({
      success: true,
      accessToken,
      sessionId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      instructions: {
        vnc: `vnc://${clientIP}:5900`,
        rdp: `rdp://${clientIP}:3389`,
        ssh: `ssh user@${clientIP} -L 5900:localhost:5900`
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération du token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action') || 'status';

    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 401 }
      );
    }

    // Vérifier le token
    const tokenData = verifyRemoteToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    // Vérifier l'IP
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') ||
                    'unknown';

    if (tokenData.ip !== clientIP) {
      return NextResponse.json(
        { error: 'IP non autorisée' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'status':
        return NextResponse.json({
          status: 'active',
          userId: tokenData.userId,
          sessionId: tokenData.sessionId,
          expiresAt: new Date(tokenData.expiresAt * 1000).toISOString(),
          permissions: tokenData.permissions
        });

      case 'connect':
        // Rediriger vers l'interface de connexion VNC/RDP
        const connectUrl = new URL('/remote-connect', request.url);
        connectUrl.searchParams.set('token', token);
        return NextResponse.redirect(connectUrl);

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}


