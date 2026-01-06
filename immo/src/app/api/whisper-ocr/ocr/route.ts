import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Créer un nouveau FormData avec le bon nom de champ
    const newFormData = new FormData();
    const file = formData.get('file') as File;
    if (file) {
      newFormData.append('image_file', file);
    }
    
    // Proxifier vers le service Whisper OCR
    const response = await fetch('http://host.docker.internal:8094/ocr', {
      method: 'POST',
      body: newFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(errorText, { 
        status: response.status,
        headers: {
          'Content-Type': 'text/plain',
        }
      });
    }

    // Retourner la réponse du service Whisper
    const result = await response.text();
    return new NextResponse(result, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Whisper OCR API Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

