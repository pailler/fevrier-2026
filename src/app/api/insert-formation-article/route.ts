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
      category: articleData.category || 'formation',
      categories: articleData.categories || null, // JSON pour catégories multiples
      author: articleData.author || 'IAHome',
      read_time: readTime,
      published_at: articleData.published_at || new Date().toISOString(),
      image_url: articleData.image_url || null,
      difficulty: articleData.difficulty || 'beginner',
      duration: articleData.duration || '1h',
      price: articleData.price || 0,
      is_published: articleData.is_published !== undefined ? articleData.is_published : true
    };

    const { data, error } = await supabaseAdmin
      .from('formation_articles')
      .insert([article])
      .select()
      .single();

    if (error) {
      console.error('Erreur insertion formation:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Créer automatiquement un post LinkedIn si la formation est publiée
    if (article.is_published && data) {
      const formationUrl = `/formation/${slug}`;
      
      const linkedinResult = await createLinkedInPost({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || null,
        url: formationUrl || null,
        image_url: article.image_url || null,
        type: 'formation',
        source_id: data.id || null
      });

      if (linkedinResult.success) {
        console.log('✅ Post LinkedIn créé automatiquement pour la formation:', data.id);
      } else {
        console.warn('⚠️ Erreur lors de la création du post LinkedIn:', linkedinResult.error);
        // Ne pas faire échouer l'insertion de la formation si le post LinkedIn échoue
      }
    }

    return NextResponse.json({ 
      success: true, 
      data,
      linkedinPostCreated: article.is_published ? true : false
    });
  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

