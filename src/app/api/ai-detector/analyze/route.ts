import { NextRequest, NextResponse } from 'next/server';
import { analyzeTextContent } from '@/lib/ai-detector/analyzeText';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface AnalysisRequest {
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const { text }: AnalysisRequest = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Le texte doit contenir au moins 50 caractères' },
        { status: 400 }
      );
    }

    const result = await analyzeTextContent(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse du texte. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
