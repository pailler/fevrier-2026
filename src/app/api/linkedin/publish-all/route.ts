import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabaseAdmin = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

/**
 * POST /api/linkedin/publish-all
 * Publie automatiquement tous les posts LinkedIn en attente
 * Optionnel: autoPublish=true pour publier automatiquement sans confirmation
 */
export async function POST(request: NextRequest) {
  try {
    const { autoPublish = false } = await request.json();

    // Récupérer tous les posts non publiés
    const { data: pendingPosts, error: fetchError } = await supabaseAdmin
      .from('linkedin_posts')
      .select('*')
      .eq('is_published', false)
      .order('created_at', { ascending: true });

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    if (!pendingPosts || pendingPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun post en attente de publication',
        published: 0,
        failed: 0
      });
    }

    const results = {
      published: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Publier chaque post
    for (const post of pendingPosts) {
      try {
        const publishUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/linkedin/publish`;
        
        const response = await fetch(publishUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            postId: post.id,
            autoPublish: autoPublish
          })
        });

        const result = await response.json();

        if (result.success) {
          results.published++;
        } else {
          results.failed++;
          results.errors.push(`Post ${post.id}: ${result.error || 'Erreur inconnue'}`);
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Post ${post.id}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Traitement terminé: ${results.published} publiés, ${results.failed} échecs`,
      ...results
    });
  } catch (error: any) {
    console.error('Erreur lors de la publication en masse:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur inconnue' },
      { status: 500 }
    );
  }
}





