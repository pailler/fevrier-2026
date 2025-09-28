import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎵 Whisper Simple - Début du traitement');
    
    const formData = await request.formData();
    const file = formData.get('file') as File || formData.get('audio_file') as File;
    const type = formData.get('type') as string || 'AUDIO';
    const userId = formData.get('userId') as string || 'test';

    console.log('📁 Fichier reçu:', file?.name, 'Taille:', file?.size, 'Type:', type);

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // Validation de la taille (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Maximum: 100MB` },
        { 
          status: 413,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // URL de destination
    const targetUrl = 'http://192.168.1.150:8092/asr';
    console.log('🎯 Envoi vers:', targetUrl);

    // Créer FormData pour Whisper
    const proxyFormData = new FormData();
    proxyFormData.append('audio_file', file);

    console.log('📡 Envoi vers Whisper API...');
    
    // Appel à l'API Whisper
    const response = await fetch(targetUrl, {
      method: 'POST',
      body: proxyFormData,
      headers: {
        'Accept': 'application/json, text/plain, */*',
      }
    });

    console.log('📊 Réponse Whisper:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur Whisper:', errorText);
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
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    const result = await response.text();
    console.log('✅ Résultat Whisper:', result);

    return NextResponse.json({
      success: true,
      result: result,
      filename: file.name,
      size: file.size
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('❌ Erreur Whisper Simple:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : String(error)
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}


