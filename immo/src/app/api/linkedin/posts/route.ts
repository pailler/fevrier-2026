import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabaseAdmin = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

/**
 * GET /api/linkedin/posts
 * Récupère la liste des posts LinkedIn
 * Query params: status (all|published|pending), limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('linkedin_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtrer par statut
    if (status === 'published') {
      query = query.eq('is_published', true);
    } else if (status === 'pending') {
      query = query.eq('is_published', false);
    }

    const { data: posts, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Récupérer les analytics pour chaque post et normaliser les données
    const postsWithAnalytics = await Promise.all(
      (posts || []).map(async (post: any) => {
        const { data: analytics } = await supabaseAdmin
          .from('linkedin_analytics')
          .select('*')
          .eq('post_id', post.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(); // Utiliser maybeSingle() pour éviter l'erreur si aucun analytics

        // Normaliser les données pour garantir que tous les champs sont valides
        // S'assurer que url est toujours string | null (jamais undefined)
        const normalizedUrl = (post.url && typeof post.url === 'string') ? post.url : null;
        const normalizedExcerpt = (post.excerpt && typeof post.excerpt === 'string') ? post.excerpt : null;
        const normalizedImageUrl = (post.image_url && typeof post.image_url === 'string') ? post.image_url : null;
        
        return {
          id: post.id || '',
          title: post.title || '',
          content: post.content || '',
          excerpt: normalizedExcerpt,
          url: normalizedUrl, // Toujours string | null, jamais undefined
          image_url: normalizedImageUrl,
          type: (post.type === 'blog' || post.type === 'formation') ? post.type : 'blog',
          source_id: post.source_id || null,
          is_published: Boolean(post.is_published),
          published_at: post.published_at || null,
          scheduled_at: post.scheduled_at || null,
          engagement: Number(post.engagement) || 0,
          linkedin_post_id: post.linkedin_post_id || null,
          error_message: post.error_message || null,
          created_at: post.created_at || new Date().toISOString(),
          analytics: analytics || null
        };
      })
    );

    // Compter le total
    let countQuery = supabaseAdmin
      .from('linkedin_posts')
      .select('id', { count: 'exact', head: true });

    if (status === 'published') {
      countQuery = countQuery.eq('is_published', true);
    } else if (status === 'pending') {
      countQuery = countQuery.eq('is_published', false);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      posts: postsWithAnalytics,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des posts LinkedIn:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/linkedin/posts
 * Crée un nouveau post LinkedIn manuellement
 */
export async function POST(request: NextRequest) {
  try {
    const postData = await request.json();

    const { title, content, url, image_url, type, source_id } = postData;

    if (!title || !content || !type) {
      return NextResponse.json(
        { success: false, error: 'title, content et type sont requis' },
        { status: 400 }
      );
    }

    const post = {
      title,
      content,
      excerpt: postData.excerpt || null,
      url,
      image_url: image_url || null,
      type: type as 'blog' | 'formation',
      source_id: source_id || null,
      is_published: false,
      scheduled_at: postData.scheduled_at || null,
      engagement: 0,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('linkedin_posts')
      .insert([post])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post: data
    });
  } catch (error: any) {
    console.error('Erreur lors de la création du post LinkedIn:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur inconnue' },
      { status: 500 }
    );
  }
}


