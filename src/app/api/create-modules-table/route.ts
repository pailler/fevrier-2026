import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase avec la clé de service
const supabaseAdmin = createClient(
  'https://xemtoyzcihmncbrlsmhr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM'
);

export async function POST(request: NextRequest) {
  try {
    // Vérifier si la table modules existe déjà
    const { data: existingModules, error: checkError } = await supabaseAdmin
      .from('modules')
      .select('id')
      .limit(1);

    if (!checkError && existingModules && existingModules.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Table modules existe déjà avec des données' 
      });
    }

    // Si la table n'existe pas, créer des modules de test directement
    const modulesData = [
      { id: 'whisper-ia', title: 'Whisper IA', description: 'Transcription audio en texte avec IA', category: 'Audio', price: 0.10, url: '/whisper' },
      { id: 'stablediffusion', title: 'Stable Diffusion', description: 'Génération d\'images par IA avec diffusion stable', category: 'Image', price: 0.10, url: '/stablediffusion' },
      { id: 'pdf-converter', title: 'PDF Converter', description: 'Conversion et manipulation de PDF', category: 'Document', price: 0.02, url: '/pdf' },
      { id: 'qr-generator', title: 'QR Code Generator', description: 'Génération de codes QR', category: 'Utilitaire', price: 0.01, url: '/qrcodes' },
      { id: 'librespeed', title: 'LibreSpeed', description: 'Test de vitesse internet', category: 'Réseau', price: 0.00, url: '/librespeed' },
      { id: 'psitransfer', title: 'PsiTransfer', description: 'Transfert de fichiers sécurisé', category: 'Fichier', price: 0.00, url: '/psitransfer' }
    ];

    // Insérer les modules
    const { data: insertedModules, error: insertError } = await supabaseAdmin
      .from('modules')
      .insert(modulesData)
      .select();

    if (insertError) {
      console.error('Erreur insertion modules:', insertError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de l\'insertion des modules',
        details: insertError 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Modules créés avec succès',
      data: insertedModules
    });

  } catch (error: any) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur inattendue lors de la création des modules',
      details: error.message 
    }, { status: 500 });
  }
}
