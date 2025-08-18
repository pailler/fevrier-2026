import { NextRequest, NextResponse } from 'next/server';
import { validateAccessToken, hasPermission } from '../../../utils/accessToken';

// Configuration des credentials pour chaque module
const MODULE_CREDENTIALS: { [key: string]: { username: string; password: string } } = {
  'IAmetube': {
    username: process.env.METUBE_USERNAME || 'admin',
    password: process.env.METUBE_PASSWORD || 'password'
  },
  'stablediffusion': {
    username: process.env.STABLEDIFFUSION_USERNAME || 'admin',
    password: process.env.STABLEDIFFUSION_PASSWORD || 'Rasulova75'
  },
  'IAphoto': {
    username: process.env.IAPHOTO_USERNAME || 'admin',
    password: process.env.IAPHOTO_PASSWORD || 'password'
  },
  'IAvideo': {
    username: process.env.IAVIDEO_USERNAME || 'admin',
    password: process.env.IAVIDEO_PASSWORD || 'password'
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const module = searchParams.get('module');

    if (!token || !module) {
      return NextResponse.json(
        { error: 'Token ou module manquant' },
        { status: 400 }
      );
    }

    // Valider le token d'accès
    const accessData = await validateAccessToken(token);
    if (!accessData) {
      console.error('❌ Token invalide ou expiré:', token);
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 403 }
      );
    }

    // Vérifier les permissions
    if (!hasPermission(accessData, 'access')) {
      console.error('❌ Permissions insuffisantes pour le token:', token);
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

    // Configuration des URLs de base pour chaque module
    const moduleUrls: { [key: string]: string } = {
      'IAmetube': '/api/proxy-metube',
      'stablediffusion': 'https://stablediffusion.regispailler.fr',
      'IAphoto': 'https://iaphoto.regispailler.fr',
      'IAvideo': 'https://iavideo.regispailler.fr',
    };

    const targetUrl = moduleUrls[module];
    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Module non reconnu' },
        { status: 400 }
      );
    }

    // Récupérer les credentials pour ce module
    const credentials = MODULE_CREDENTIALS[module];
    if (!credentials) {
      return NextResponse.json(
        { error: 'Configuration des credentials manquante' },
        { status: 500 }
      );
    }

    // Créer l'URL de la page proxy qui gère l'authentification
    const proxyUrl = `http://iahome.fr/proxy/${module}?token=${token}`;
    
    console.log('✅ Redirection vers page proxy:', proxyUrl);
    console.log('🔐 Module:', module, 'avec authentification automatique');

    return NextResponse.redirect(proxyUrl);

  } catch (error) {
    console.error('❌ Erreur proxy:', error);
    return NextResponse.json(
      { error: 'Erreur interne du proxy' },
      { status: 500 }
    );
  }
} 
