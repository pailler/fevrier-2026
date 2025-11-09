import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase avec la clé de service
const supabaseAdmin = createClient(
  'https://xemtoyzcihmncbrlsmhr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM'
);

export async function POST(request: NextRequest) {
  try {
    const { moduleId } = await request.json();

    if (!moduleId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID du module requis' 
      }, { status: 400 });
    }

    // Supprimer le module
    const { error } = await supabaseAdmin
      .from('modules')
      .delete()
      .eq('id', moduleId);

    if (error) {
      console.error('Erreur lors de la suppression du module:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la suppression du module',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Module ${moduleId} supprimé avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du module:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

