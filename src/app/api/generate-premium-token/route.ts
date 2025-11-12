import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/utils/supabaseConfig';

// Utiliser la clé anon au lieu de la clé service role
const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey()
);

export async function POST(request: NextRequest) {
  try {
    const { moduleName, userId } = await request.json();

    if (!moduleName || !userId) {
      return NextResponse.json(
        { error: 'Module name and user ID are required' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Vérifier que le module existe
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, description, price')
      .eq('title', moduleName)
      .single();

    if (moduleError || !module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Vérifier si un accès premium existe déjà pour cet utilisateur et ce module
    const { data: existingApplication, error: existingError } = await supabase
      .from('user_applications')
      .select('id, expires_at')
      .eq('user_id', userId)
      .eq('module_title', moduleName)
      .eq('access_level', 'premium')
      .eq('is_active', true)
      .single();

    if (existingApplication) {
      // Si l'accès existe et n'est pas expiré, le retourner
      if (new Date(existingApplication.expires_at) > new Date()) {
        return NextResponse.json({
          success: true,
          application: existingApplication,
          message: 'Existing premium access found'
        });
      }
    }

    // Créer une entrée dans user_applications pour l'accès premium
    // Déterminer la durée d'expiration selon le type de module
    const expiresAt = new Date();
    const aiModules = ['whisper', 'stablediffusion', 'ruinedfooocus', 'comfyui'];
    const isAIModule = aiModules.some(id => module.title.toLowerCase().includes(id));
    
    // Modules IA : 30 jours (1 mois), Modules essentiels : 90 jours (3 mois)
    if (isAIModule) {
      expiresAt.setDate(expiresAt.getDate() + 30); // 1 mois
    } else {
      expiresAt.setDate(expiresAt.getDate() + 90); // 3 mois
    }
    
    // Définir le quota d'utilisation à 20 pour tous les modules
    const maxUsage = 20;

    const { data: newApplication, error: insertError } = await supabase
      .from('user_applications')
      .insert({
        user_id: userId,
        module_id: module.id.toString(),
        module_title: module.title,
        access_level: 'premium',
        is_active: true,
        expires_at: expiresAt.toISOString(),
        max_usage: maxUsage,
        usage_count: 0
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create premium access', details: insertError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      application: newApplication,
      message: 'Premium access created successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}

