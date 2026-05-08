import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from './supabaseConfig';

const supabaseAdmin = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erreur inconnue';
}

export interface LinkedInPostData {
  title: string;
  content: string;
  excerpt?: string | null;
  url: string | null;
  image_url?: string | null;
  type: 'blog' | 'formation';
  source_id: string | null; // ID de l'article ou de la formation
}

/**
 * Génère le contenu d'un post LinkedIn à partir d'un article ou d'une formation
 */
export function generateLinkedInContent(data: LinkedInPostData): string {
  const { title, excerpt, url, type } = data;
  
  // Créer un message engageant pour LinkedIn
  const typeLabel = type === 'formation' ? 'formation' : 'article';
  const emoji = type === 'formation' ? '🎓' : '📝';
  
  let postContent = `${emoji} Nouveau ${typeLabel} disponible !\n\n`;
  postContent += `📌 ${title}\n\n`;
  
  if (excerpt && typeof excerpt === 'string') {
    // Limiter l'extrait à 200 caractères pour LinkedIn
    const shortExcerpt = excerpt.length > 200 
      ? excerpt.substring(0, 197) + '...' 
      : excerpt;
    postContent += `${shortExcerpt}\n\n`;
  }
  
  if (url) {
    postContent += `🔗 Découvrez-en plus : ${url}\n\n`;
  }
  
  postContent += `#IA #IntelligenceArtificielle #Tech #Formation`;
  
  if (type === 'formation') {
    postContent += ` #Apprentissage`;
  } else {
    postContent += ` #Blog`;
  }
  
  return postContent;
}

/**
 * Crée un post LinkedIn dans la base de données
 */
export async function createLinkedInPost(data: LinkedInPostData): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const postContent = generateLinkedInContent(data);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://iahome.fr';
    
    // S'assurer que l'URL est valide
    let fullUrl = data.url || '';
    if (fullUrl && !fullUrl.startsWith('http')) {
      fullUrl = `${baseUrl}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
    }
    
    // Créer le post LinkedIn dans la base de données
    const linkedinPost = {
      title: data.title,
      content: postContent,
      excerpt: data.excerpt || null,
      url: fullUrl || null,
      image_url: data.image_url || null,
      type: data.type,
      source_id: data.source_id,
      is_published: false, // Par défaut, non publié (nécessite validation manuelle ou automatique)
      scheduled_at: null,
      engagement: 0,
      created_at: new Date().toISOString()
    };

    const { data: post, error } = await supabaseAdmin
      .from('linkedin_posts')
      .insert([linkedinPost])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du post LinkedIn:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Post LinkedIn créé avec succès:', post.id);
    return { success: true, postId: post.id };
  } catch (error: unknown) {
    console.error('Erreur lors de la création du post LinkedIn:', error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Publie un post LinkedIn via l'API LinkedIn (nécessite configuration)
 */
export async function publishLinkedInPost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Récupérer le post depuis la base de données
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('linkedin_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return { success: false, error: 'Post non trouvé' };
    }

    // Récupérer la configuration LinkedIn
    const { data: config, error: configError } = await supabaseAdmin
      .from('linkedin_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      console.warn('⚠️ Configuration LinkedIn non trouvée. Le post a été créé mais n\'a pas été publié automatiquement.');
      // Mettre à jour le statut du post
      await supabaseAdmin
        .from('linkedin_posts')
        .update({ 
          is_published: false,
          error_message: 'Configuration LinkedIn non disponible'
        })
        .eq('id', postId);
      
      return { success: false, error: 'Configuration LinkedIn non disponible' };
    }

    // TODO: Implémenter l'appel à l'API LinkedIn
    // Pour l'instant, on marque juste le post comme prêt à être publié
    // L'utilisateur devra le publier manuellement ou via un webhook
    
    const { error: updateError } = await supabaseAdmin
      .from('linkedin_posts')
      .update({ 
        is_published: true,
        published_at: new Date().toISOString()
      })
      .eq('id', postId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Enregistrer dans linkedin_analytics
    await supabaseAdmin
      .from('linkedin_analytics')
      .insert([{
        post_id: postId,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        engagement: 0,
        created_at: new Date().toISOString()
      }]);

    return { success: true };
  } catch (error: unknown) {
    console.error('Erreur lors de la publication du post LinkedIn:', error);
    return { success: false, error: getErrorMessage(error) };
  }
}


