import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
);

export async function POST(request: NextRequest) {
  const { userId, email } = await request.json();

  if (!userId || !email) {
    return NextResponse.json({ success: false, error: 'User ID and email are required' }, { status: 400 });
  }

  const moduleId = 'metube';
  const moduleTitle = 'MeTube';

  try {
    const { data: existingAccess, error: fetchAccessError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (existingAccess) {
      return NextResponse.json({ success: true, message: 'MeTube déjà activé pour cet utilisateur.' });
    }

    // MeTube est un module essentiel : 90 jours (3 mois)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 jours (3 mois)

    const { data: accessData, error: createAccessError } = await supabase
      .from('user_applications')
      .insert([{
        user_id: userId,
        module_id: moduleId,
        module_title: moduleTitle,
        is_active: true,
        access_level: 'premium',
        usage_count: 0,
        max_usage: null,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createAccessError) {
      console.error('❌ Erreur création accès MeTube:', createAccessError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la création de l\'accès MeTube' 
      }, { status: 500 });
    }

    console.log('✅ Accès MeTube créé avec succès:', accessData.id);

    return NextResponse.json({
      success: true,
      message: 'MeTube activé avec succès',
      accessId: accessData.id,
      moduleId: moduleId,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur inattendue lors de l\'activation de MeTube:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }, { status: 500 });
  }
}

