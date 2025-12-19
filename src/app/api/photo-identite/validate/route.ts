import { NextRequest, NextResponse } from 'next/server';
import { photoIdentiteService } from '@/utils/photoIdentiteService';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Valider la photo
    const validationResult = await photoIdentiteService.validatePhoto(buffer, documentType);

    return NextResponse.json(validationResult);
  } catch (error: any) {
    console.error('Erreur lors de la validation:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la validation de la photo' },
      { status: 500 }
    );
  }
}

