import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageContent } from '@/lib/ai-detector/analyzeImage';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucune image fournie' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await analyzeImageContent(buffer, file.type);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'image:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse de l\'image. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
