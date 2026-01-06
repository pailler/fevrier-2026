import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase avec la clé de service
const supabaseAdmin = createClient(
  'https://xemtoyzcihmncbrlsmhr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM'
);

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les modules (payants et gratuits)
    const { data: allModules, error } = await supabaseAdmin
      .from('modules')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des modules:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la récupération des modules',
        details: error 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      modules: allModules || [],
      total: allModules?.length || 0,
      paid: allModules?.filter(m => m.price > 0).length || 0,
      free: allModules?.filter(m => m.price === 0).length || 0
    });

  } catch (error: any) {
    console.error('Erreur inattendue lors de la récupération des modules:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur inattendue lors de la récupération des modules',
      details: error.message 
    }, { status: 500 });
  }
}

