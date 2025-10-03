import { NextRequest, NextResponse } from 'next/server';

// Configuration des limites pour cette route spécifique
export const config = {
  // Configuration pour les uploads de fichiers
  maxDuration: 1800, // 30 minutes maximum pour les gros fichiers
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File || formData.get('audio_file') as File;
    const type = formData.get('type') as 'AUDIO' | 'VIDEO' | 'IMAGE';
    const userId = formData.get('userId') as string;

    console.log('🎵 Whisper Upload - Fichier reçu:', file?.name, 'Type:', type, 'User:', userId);

    if (!file || !type || !userId) {
      return NextResponse.json(
        { error: 'Fichier, type et userId requis' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
          }
        }
      );
    }

    // Validation simplifiée de la taille (2GB max)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Maximum: ${maxSize / 1024 / 1024}MB` },
        { 
          status: 413,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
          }
        }
      );
    }

    // Déterminer l'URL de destination selon le type (noms de conteneurs corrigés)
    let targetUrl: string;
    switch (type) {
      case 'AUDIO':
        targetUrl = 'http://localhost:8092/asr';
        break;
      case 'VIDEO':
        targetUrl = 'http://localhost:8095/asr';
        break;
      case 'IMAGE':
        targetUrl = 'http://localhost:8094/ocr';
        break;
      default:
        return NextResponse.json(
          { error: 'Type de fichier non supporté' },
          { 
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
            }
          }
        );
    }

    // Créer un nouveau FormData pour le proxy
    const proxyFormData = new FormData();
    proxyFormData.append('audio_file', file);

    // Faire l'appel au service Whisper
    const response = await fetch(targetUrl, {
      method: 'POST',
      body: proxyFormData,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          error: 'Erreur lors de la transcription',
          details: errorText,
          status: response.status
        },
        { 
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
          }
        }
      );
    }

    const result = await response.text();
    
    return NextResponse.json({
      success: true,
      result: result
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
      }
    });

  } catch (error) {
    console.error('Erreur Whisper upload:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
        }
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}
