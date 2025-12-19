import { NextRequest, NextResponse } from 'next/server';
import { photoIdentiteService } from '@/utils/photoIdentiteService';
import { supabase } from '@/utils/supabaseClient';

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
    const email = formData.get('email') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Traiter la photo
    const processedPhoto = await photoIdentiteService.processPhoto(buffer, documentType);

    // Si un email est fourni, envoyer la photo par email
    if (email) {
      try {
        await photoIdentiteService.sendPhotoByEmail(email, processedPhoto, documentType);
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailError);
        // Ne pas faire échouer la requête si l'email échoue
      }
    }

    return NextResponse.json({
      imageUrl: processedPhoto.imageUrl,
      codeANTS: processedPhoto.codeANTS,
      format: processedPhoto.format,
      downloadUrl: processedPhoto.downloadUrl,
    });
  } catch (error: any) {
    console.error('Erreur lors du traitement:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du traitement de la photo' },
      { status: 500 }
    );
  }
}

