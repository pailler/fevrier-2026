import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase avec la clé de service
const supabaseAdmin = createClient(
  'https://xemtoyzcihmncbrlsmhr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM'
);

export async function POST(request: NextRequest) {
  try {
    const { title, description, category, price, icon, url, is_paid } = await request.json();

    if (!title || !description || !category || price === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Titre, description, catégorie et prix sont requis' 
      }, { status: 400 });
    }

    // Vérifier si le module existe déjà
    const { data: existingModule } = await supabaseAdmin
      .from('modules')
      .select('id')
      .eq('title', title)
      .single();

    if (existingModule) {
      return NextResponse.json({ 
        success: false, 
        error: 'Un module avec ce titre existe déjà' 
      }, { status: 409 });
    }

    // Ajouter le module
    const moduleData: any = {
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      description,
      category,
      price: parseFloat(price)
    };

    // Ajouter les champs optionnels s'ils existent
    if (url) moduleData.url = url;
    if (is_paid !== undefined) moduleData.is_paid = is_paid;

    const { data: newModule, error } = await supabaseAdmin
      .from('modules')
      .insert([moduleData])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de l\'ajout du module:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de l\'ajout du module',
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      module: newModule,
      message: 'Module ajouté avec succès' 
    });

  } catch (error: any) {
    console.error('Erreur inattendue lors de l\'ajout du module:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur inattendue lors de l\'ajout du module',
      details: error.message 
    }, { status: 500 });
  }
}
