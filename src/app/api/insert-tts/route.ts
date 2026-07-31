import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());

const TTS_MODULE = {
  id: 'tts',
  title: 'Synthèse vocale IA (TTS)',
  description:
    'Convertissez du texte en voix naturelle avec Coqui XTTS v2 : 58 voix, 17 langues, clonage vocal et export WAV/MP3.',
  category: 'IA Audio',
  price: 100,
  url: '/card/tts',
  image_url: '/images/whisper.jpg',
  is_visible: true,
};

export async function POST() {
  try {
    const { data: existing } = await supabase.from('modules').select('id').eq('id', 'tts').maybeSingle();

    const payload = {
      ...TTS_MODULE,
      updated_at: new Date().toISOString(),
      ...(existing ? {} : { created_at: new Date().toISOString() }),
    };

    const { data, error } = existing
      ? await supabase.from('modules').update(payload).eq('id', 'tts').select().single()
      : await supabase.from('modules').insert([payload]).select().single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: existing ? 'Module TTS mis à jour' : 'Module TTS inséré',
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
