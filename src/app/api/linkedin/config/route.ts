import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabaseAdmin = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

/**
 * GET /api/linkedin/config
 * Récupère la configuration LinkedIn active
 */
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('linkedin_config')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Erreur lors de la récupération de la configuration:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      config: data || {
        access_token: '',
        linkedin_person_id: '',
        is_active: false
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la configuration:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/linkedin/config
 * Sauvegarde ou met à jour la configuration LinkedIn
 */
export async function POST(request: NextRequest) {
  try {
    const configData = await request.json();
    const { access_token, linkedin_person_id, is_active } = configData;

    if (!access_token || !linkedin_person_id) {
      return NextResponse.json(
        { success: false, error: 'access_token et linkedin_person_id sont requis' },
        { status: 400 }
      );
    }

    // Désactiver toutes les configurations existantes si on active une nouvelle
    if (is_active) {
      await supabaseAdmin
        .from('linkedin_config')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');
    }

    // Vérifier si une configuration existe déjà
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('linkedin_config')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, error: `Erreur lors de la récupération: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (existing) {
      // Mettre à jour la configuration existante
      const { error } = await supabaseAdmin
        .from('linkedin_config')
        .update({
          access_token,
          linkedin_person_id,
          is_active: Boolean(is_active),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) {
        return NextResponse.json(
          { success: false, error: `Erreur lors de la mise à jour: ${error.message}` },
          { status: 500 }
        );
      }
    } else {
      // Créer une nouvelle configuration
      const { error } = await supabaseAdmin
        .from('linkedin_config')
        .insert([{
          access_token,
          linkedin_person_id,
          is_active: Boolean(is_active),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        return NextResponse.json(
          { success: false, error: `Erreur lors de la création: ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration sauvegardée avec succès'
    });
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde de la configuration:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur inconnue' },
      { status: 500 }
    );
  }
}



