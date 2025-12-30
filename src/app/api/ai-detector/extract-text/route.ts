import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Configuration pour les uploads de fichiers
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 secondes max pour le traitement

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    console.log('📄 Fichier reçu:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText = '';

    try {
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        console.log('📄 Extraction PDF en cours...');
        // Extraction du texte depuis PDF
        try {
          const data = await pdfParse(buffer, {
            // Options pour améliorer l'extraction
            max: 0, // Pas de limite de pages
          });
          extractedText = data.text || '';
          console.log('✅ Texte extrait du PDF:', extractedText.length, 'caractères');
          
          // Si le texte est vide, le PDF pourrait être une image scannée
          if (!extractedText || extractedText.trim().length === 0) {
            return NextResponse.json(
              { 
                error: 'Impossible d\'extraire du texte de ce PDF. Le fichier contient peut-être uniquement des images scannées. Veuillez utiliser un PDF avec du texte sélectionnable.',
                details: 'PDF sans texte extractible'
              },
              { status: 400 }
            );
          }
        } catch (pdfError) {
          console.error('❌ Erreur pdf-parse:', pdfError);
          throw new Error(`Erreur lors de l'extraction PDF: ${pdfError instanceof Error ? pdfError.message : 'Erreur inconnue'}`);
        }
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        console.log('📄 Extraction DOCX en cours...');
        // Extraction du texte depuis DOCX
        try {
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value || '';
          console.log('✅ Texte extrait du DOCX:', extractedText.length, 'caractères');
          
          if (result.messages.length > 0) {
            console.warn('⚠️ Avertissements lors de l\'extraction DOCX:', result.messages);
          }
          
          if (!extractedText || extractedText.trim().length === 0) {
            return NextResponse.json(
              { 
                error: 'Impossible d\'extraire du texte de ce fichier DOCX. Le fichier est peut-être vide ou corrompu.',
                details: 'DOCX sans texte extractible'
              },
              { status: 400 }
            );
          }
        } catch (docxError) {
          console.error('❌ Erreur mammoth:', docxError);
          throw new Error(`Erreur lors de l'extraction DOCX: ${docxError instanceof Error ? docxError.message : 'Erreur inconnue'}`);
        }
      } else if (
        fileType === 'application/msword' ||
        fileName.endsWith('.doc')
      ) {
        return NextResponse.json(
          { error: 'Le format .doc (ancien format Word) n\'est pas supporté. Veuillez convertir votre fichier en .docx ou .txt' },
          { status: 400 }
        );
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        console.log('📄 Lecture du fichier texte...');
        // Pour les fichiers texte, on peut les lire directement
        extractedText = buffer.toString('utf-8');
        console.log('✅ Texte lu:', extractedText.length, 'caractères');
      } else {
        console.error('❌ Format non supporté:', fileType, fileName);
        return NextResponse.json(
          { 
            error: 'Format de fichier non supporté. Formats supportés: .txt, .pdf, .docx',
            receivedType: fileType,
            receivedName: file.name
          },
          { status: 400 }
        );
      }

      if (!extractedText || extractedText.trim().length < 10) {
        console.warn('⚠️ Texte extrait trop court:', extractedText.length);
        return NextResponse.json(
          { 
            error: 'Impossible d\'extraire suffisamment de texte du fichier. Le fichier est peut-être vide, corrompu, ou contient uniquement des images.',
            extractedLength: extractedText.length
          },
          { status: 400 }
        );
      }

      console.log('✅ Extraction réussie:', extractedText.length, 'caractères');
      return NextResponse.json({
        success: true,
        text: extractedText,
        length: extractedText.length,
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction du texte:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      return NextResponse.json(
        { 
          error: 'Erreur lors de l\'extraction du texte. Le fichier est peut-être corrompu ou dans un format non supporté.',
          details: errorMessage,
          ...(process.env.NODE_ENV === 'development' && errorStack ? { stack: errorStack } : {})
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors du traitement du fichier:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du fichier' },
      { status: 500 }
    );
  }
}

