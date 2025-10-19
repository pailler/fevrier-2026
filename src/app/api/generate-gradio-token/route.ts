import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sign } from 'jsonwebtoken';
import { GradioToken } from '../../../utils/gradioToken';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Clé secrète pour les tokens (à stocker dans les variables d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// IPs autorisées
const ALLOWED_IPS = [
  '90.90.226.59', // Votre IP principale
  '127.0.0.1',    // Localhost
  '::1',          // IPv6 localhost
  'localhost'     // Localhost
];

export async function POST(request: NextRequest) {
  try {
    // Récupérer l'IP du client
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
    
    // Vérifier le token avec Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }
    
    // Récupérer les données de la requête
    const { moduleId, moduleTitle } = await request.json();
    
    if (!moduleId || !moduleTitle) {
      return NextResponse.json(
        { error: 'moduleId et moduleTitle requis' },
        { status: 400 }
      );
    }
    
    // Vérifier l'accès utilisateur au module
    const { data: accessData, error: accessError } = await supabase
      .from('module_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .single();
    
    if (accessError || !accessData) {
      return NextResponse.json(
        { error: 'Accès non autorisé à ce module' },
        { status: 403 }
      );
    }
    
    // Vérifier si l'accès n'a pas expiré
    if (accessData.expires_at) {
      const now = new Date();
      const expiresAt = new Date(accessData.expires_at);
      if (expiresAt <= now) {
        return NextResponse.json(
          { error: 'Accès expiré' },
          { status: 403 }
        );
      }
    }
    
    // Créer le token Gradio (valide 1 heure)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + (60 * 60); // 1 heure
    
    const gradioTokenData: GradioToken = {
      userId: user.id,
      userEmail: user.email,
      moduleId: moduleId,
      moduleTitle: moduleTitle,
      accessLevel: 'premium',
      expiresAt: expiresAt,
      permissions: ['read', 'write'],
      issuedAt: now,
      iat: now,
      exp: expiresAt
    };
    
    // Signer le token
    const gradioToken = sign(gradioTokenData, JWT_SECRET, { expiresIn: '1h' });
    
    // Enregistrer l'utilisation dans la base de données
    await supabase
      .from('gradio_access_logs')
      .insert({
        user_id: user.id,
        module_id: moduleId,
        module_title: moduleTitle,
        ip_address: clientIP,
        token_issued_at: new Date().toISOString(),
        expires_at: new Date(expiresAt * 1000).toISOString()
      });
    
    return NextResponse.json({
      success: true,
      token: gradioToken,
      expiresAt: expiresAt,
      moduleTitle: moduleTitle,
      message: 'Token généré avec succès'
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

