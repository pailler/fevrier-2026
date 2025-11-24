import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { createLinkedInPost } from '@/utils/linkedinHelper';

const supabaseAdmin = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    const articleData = await request.json();

    // Calculer le temps de lecture approximatif (250 mots par minute)
    const wordCount = articleData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 250));

    // Générer un slug à partir du titre si non fourni
    const slug = articleData.slug || articleData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const article = {
      title: articleData.title,
      slug: slug,
      content: articleData.content,
      excerpt: articleData.excerpt,
      category: articleData.category || 'resources',
      author: articleData.author || 'IAHome',
      read_time: readTime,
      published_at: articleData.published_at || new Date().toISOString(),
      image_url: articleData.image_url || null,
      status: articleData.status || 'published'
    };

    const { data, error } = await supabaseAdmin
      .from('blog_articles')
      .insert([article])
      .select()
      .single();

    if (error) {
      console.error('Erreur insertion article:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Créer automatiquement un post LinkedIn si l'article est publié
    if (article.status === 'published' && data) {
      const articleUrl = `/blog/${slug}`;
      
      const linkedinResult = await createLinkedInPost({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || null,
        url: articleUrl || null,
        image_url: article.image_url || null,
        type: 'blog',
        source_id: data.id || null
      });

      if (linkedinResult.success) {
        console.log('✅ Post LinkedIn créé automatiquement pour l\'article:', data.id);
      } else {
        console.warn('⚠️ Erreur lors de la création du post LinkedIn:', linkedinResult.error);
        // Ne pas faire échouer l'insertion de l'article si le post LinkedIn échoue
      }
    }

    return NextResponse.json({ 
      success: true, 
      data,
      linkedinPostCreated: article.status === 'published' ? true : false
    });
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

