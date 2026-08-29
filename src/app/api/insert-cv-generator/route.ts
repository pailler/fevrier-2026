import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());

const CV_MODULE = {
  id: 'cv-generator',
  title: 'Générateur de CV IA',
  description:
    'Créez un CV professionnel optimisé pour les ATS avec l\'IA : adaptation au poste, score ATS, lettre de motivation et export PDF.',
  category: 'Productivité',
  price: 100,
  url: '/card/cv-generator',
  image_url: '/images/cv-generator.svg',
  is_visible: true,
};

export async function POST() {
  try {
    const { data: existing } = await supabase
      .from('modules')
      .select('id')
      .eq('id', 'cv-generator')
      .maybeSingle();

    const payload = {
      ...CV_MODULE,
      updated_at: new Date().toISOString(),
      ...(existing ? {} : { created_at: new Date().toISOString() }),
    };

    const { data, error } = existing
      ? await supabase.from('modules').update(payload).eq('id', 'cv-generator').select().single()
      : await supabase.from('modules').insert([payload]).select().single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: existing ? 'Module CV mis à jour' : 'Module CV inséré',
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
