import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import { publishLinkedInPost } from '@/utils/linkedinHelper';

const supabaseAdmin = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

/**
 * API pour publier un post LinkedIn
 * POST /api/linkedin/publish
 * Body: { postId: string, autoPublish?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const { postId, autoPublish = false } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'postId est requis' },
        { status: 400 }
      );
    }

    // Récupérer le post depuis la base de données
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('linkedin_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return NextResponse.json(
        { success: false, error: 'Post non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le post est déjà publié
    if (post.is_published && !autoPublish) {
      return NextResponse.json(
        { success: false, error: 'Ce post est déjà publié' },
        { status: 400 }
      );
    }

    // Récupérer la configuration LinkedIn
    const { data: config, error: configError } = await supabaseAdmin
      .from('linkedin_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      // Si pas de configuration, on marque juste le post comme prêt
      const { error: updateError } = await supabaseAdmin
        .from('linkedin_posts')
        .update({ 
          is_published: true,
          published_at: new Date().toISOString(),
          error_message: 'Configuration LinkedIn non disponible - Publication manuelle requise'
        })
        .eq('id', postId);

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Post marqué comme publié. Configuration LinkedIn non disponible - Publication manuelle requise',
        postId: postId
      });
    }

    // Si on a une configuration LinkedIn avec des credentials
    if (config.access_token) {
      try {
        // Publier via l'API LinkedIn
        const linkedinApiUrl = 'https://api.linkedin.com/v2/ugcPosts';
        
        // Préparer le payload pour l'API LinkedIn
        const linkedinPayload = {
          author: `urn:li:person:${config.linkedin_person_id || config.user_id}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: post.content
              },
              shareMediaCategory: post.image_url ? 'IMAGE' : 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        };

        // Si une image est présente, l'ajouter
        if (post.image_url) {
          // TODO: Uploader l'image sur LinkedIn et obtenir l'URN
          // Pour l'instant, on publie sans image
        }

        const linkedinResponse = await fetch(linkedinApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.access_token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify(linkedinPayload)
        });

        if (!linkedinResponse.ok) {
          const errorData = await linkedinResponse.text();
          console.error('Erreur API LinkedIn:', errorData);
          
          // Mettre à jour le post avec l'erreur
          await supabaseAdmin
            .from('linkedin_posts')
            .update({ 
              error_message: `Erreur API LinkedIn: ${errorData}`,
              is_published: false
            })
            .eq('id', postId);

          return NextResponse.json(
            { success: false, error: `Erreur lors de la publication sur LinkedIn: ${errorData}` },
            { status: linkedinResponse.status }
          );
        }

        const linkedinData = await linkedinResponse.json();
        const linkedinPostId = linkedinData.id;

        // Mettre à jour le post dans la base de données
        const { error: updateError } = await supabaseAdmin
          .from('linkedin_posts')
          .update({ 
            is_published: true,
            published_at: new Date().toISOString(),
            linkedin_post_id: linkedinPostId,
            error_message: null
          })
          .eq('id', postId);

        if (updateError) {
          return NextResponse.json(
            { success: false, error: updateError.message },
            { status: 500 }
          );
        }

        // Créer une entrée dans linkedin_analytics
        await supabaseAdmin
          .from('linkedin_analytics')
          .insert([{
            post_id: postId,
            linkedin_post_id: linkedinPostId,
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            engagement: 0,
            created_at: new Date().toISOString()
          }]);

        return NextResponse.json({
          success: true,
          message: 'Post publié avec succès sur LinkedIn',
          postId: postId,
          linkedinPostId: linkedinPostId
        });

      } catch (apiError: any) {
        console.error('Erreur lors de l\'appel à l\'API LinkedIn:', apiError);
        
        // Mettre à jour le post avec l'erreur
        await supabaseAdmin
          .from('linkedin_posts')
          .update({ 
            error_message: apiError.message,
            is_published: false
          })
          .eq('id', postId);

        return NextResponse.json(
          { success: false, error: `Erreur API LinkedIn: ${apiError.message}` },
          { status: 500 }
        );
      }
    } else {
      // Pas de token d'accès, utiliser la fonction helper qui marque juste comme publié
      const result = await publishLinkedInPost(postId);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Post marqué comme publié (publication manuelle requise)',
          postId: postId
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Erreur lors de la publication du post LinkedIn:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/linkedin/publish?postId=xxx
 * Récupère les informations d'un post LinkedIn
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'postId est requis' },
        { status: 400 }
      );
    }

    const { data: post, error } = await supabaseAdmin
      .from('linkedin_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { success: false, error: 'Post non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les analytics si disponibles
    const { data: analytics } = await supabaseAdmin
      .from('linkedin_analytics')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Utiliser maybeSingle() pour éviter l'erreur si aucun analytics

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        analytics: analytics || null
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du post LinkedIn:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur inconnue' },
      { status: 500 }
    );
  }
}


