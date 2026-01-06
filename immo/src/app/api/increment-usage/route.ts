import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
);

export async function POST(request: NextRequest) {
  try {
    const { userId, moduleId } = await request.json();

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: 'User ID and module ID are required' },
        { status: 400 }
      );
    }

    // Trouver l'application utilisateur pour ce module
    const { data: application, error: fetchError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage, expires_at')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Vérifier si l'accès n'est pas expiré
    if (application.expires_at) {
      const expirationDate = new Date(application.expires_at);
      const now = new Date();
      if (expirationDate < now) {
        return NextResponse.json(
          { error: 'Access expired' },
          { status: 403 }
        );
      }
    }

    // Vérifier si le quota n'est pas dépassé
    if (application.max_usage && application.usage_count >= application.max_usage) {
      return NextResponse.json(
        { error: 'Usage quota exceeded' },
        { status: 403 }
      );
    }

    // Incrémenter le compteur d'utilisation
    const newUsageCount = (application.usage_count || 0) + 1;
    
    const { data: updatedApplication, error: updateError } = await supabase
      .from('user_applications')
      .update({
        usage_count: newUsageCount,
        last_used_at: new Date().toISOString()
      })
      .eq('id', application.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update usage count' },
        { status: 500 }
      );
    }

    // Vérifier si le quota est atteint (fin d'utilisation)
    const isQuotaReached = application.max_usage && newUsageCount >= application.max_usage;
    
    if (isQuotaReached) {
      console.log(`⚠️ Usage: Quota atteint pour module ${moduleId}, workflow doit être réinitialisé`);
    }

    return NextResponse.json({
      success: true,
      usage_count: newUsageCount,
      max_usage: application.max_usage,
      message: 'Usage count updated successfully',
      shouldResetWorkflow: isQuotaReached // Flag pour réinitialiser le workflow
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
