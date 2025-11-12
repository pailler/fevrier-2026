import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
);

export async function POST(request: NextRequest) {
  try {
    const { moduleId, userId, moduleTitle, moduleDescription, moduleCategory, moduleUrl } = await request.json();
    
    if (!moduleId || !userId || !moduleTitle) {
      return NextResponse.json({ 
        success: false, 
        error: 'moduleId, userId et moduleTitle requis' 
      }, { status: 400 });
    }

    // Vérifier si l'accès existe déjà
    const { data: existingAccess, error: checkError } = await supabase
      .from('user_applications')
      .select('id')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .single();

    if (existingAccess) {
      return NextResponse.json({ 
        success: true, 
        message: 'Module déjà activé',
        accessId: existingAccess.id
      });
    }

    // Créer l'accès module dans user_applications
    // Whisper est un module IA : 30 jours (1 mois)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 1 mois

    const { data: accessData, error: accessError } = await supabase
      .from('user_applications')
      .insert({
        user_id: userId,
        module_id: moduleId,
        module_title: moduleTitle,
        access_level: 'basic',
        is_active: true,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (accessError) {
      console.error('Erreur lors de la création de l\'accès:', accessError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la création de l\'accès: ' + accessError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Module Whisper IA activé avec succès',
      accessId: accessData.id,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
