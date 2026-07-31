import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/utils/supabaseConfig';

const supabase = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());

const REVEIL_MODULE = {
  id: 'reveil-intelligent',
  title: 'Réveil Intelligent',
  description:
    'Réveil mobile : alarmes récurrentes, musiques de réveil, prévisions météo du jour, messages adaptés aux jours fériés et vacances scolaires (zones A, B, C), synchronisé avec votre compte IAHome.',
  category: 'OUTILS QUOTIDIEN',
  price: 0,
  url: '/card/reveil-intelligent',
  image_url: '/images/reveil-intelligent.svg',
};

export async function POST(_request: NextRequest) {
  try {
    const { data: existingModule } = await supabase
      .from('modules')
      .select('id, title')
      .eq('id', 'reveil-intelligent')
      .single();

    if (existingModule) {
      const { data: updated, error: updateError } = await supabase
        .from('modules')
        .update({
          ...REVEIL_MODULE,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'reveil-intelligent')
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la mise à jour du module', details: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Module Réveil Intelligent mis à jour',
        moduleId: existingModule.id,
        module: updated,
      });
    }

    const { data: newModule, error: createError } = await supabase
      .from('modules')
      .insert([
        {
          ...REVEIL_MODULE,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la creation du module', details: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Module Réveil Intelligent cree avec succes',
      moduleId: newModule.id,
      module: newModule,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: module, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', 'reveil-intelligent')
      .single();

    if (error || !module) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: true, module });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
