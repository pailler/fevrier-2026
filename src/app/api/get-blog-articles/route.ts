import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabaseAdmin = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_articles')
      .select('id, title, slug, content')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération articles:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      articles: data || []
    });
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

























