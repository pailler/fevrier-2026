import { NextRequest, NextResponse } from 'next/server';
import { UPLOAD_LIMITS, validateFileSize } from '@/utils/uploadLimits';

// Configuration des limites pour cette route spécifique
export const config = {
  // Configuration pour les uploads de fichiers
  maxDuration: 600, // 10 minutes maximum pour les gros fichiers
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File || formData.get('audio_file') as File;
    const type = formData.get('type') as 'AUDIO' | 'VIDEO' | 'IMAGE';
    const userId = formData.get('userId') as string;

    if (!file || !type || !userId) {
      return NextResponse.json(
        { error: 'Fichier, type et userId requis' },
        { status: 400 }
      );
    }

    // Valider la taille et le type du fichier
    const validation = validateFileSize(file, type);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 413 }
      );
    }

    // Déterminer l'URL de destination selon le type
    let targetUrl: string;
    switch (type) {
      case 'AUDIO':
        targetUrl = 'http://whisper-api:9000/asr';
        break;
      case 'VIDEO':
        targetUrl = 'http://whisper-video:9000/asr';
        break;
      case 'IMAGE':
        targetUrl = 'http://whisper-ocr:8080/ocr';
        break;
      default:
        return NextResponse.json(
          { error: 'Type de fichier non supporté' },
          { status: 400 }
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
        'Content-Type': 'multipart/form-data',
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
        { status: response.status }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      result: result
    });

  } catch (error) {
    console.error('Erreur Whisper upload:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
