import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Utiliser la clé anon au lieu de la clé service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { moduleName, userId, moduleId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe dans user_applications
    const { data: user, error: userError } = await supabase
      .from('user_applications')
      .select('user_id, module_id')
      .eq('user_id', userId)
      .limit(1);

    if (userError) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', userError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // L'utilisateur n'a pas besoin d'exister dans user_applications pour générer un token
    // On continue avec la génération du token

    // Vérifier que le module existe (par ID ou par nom)
    let module;
    let moduleError;
    
    if (moduleId) {
      // Chercher par ID
      const result = await supabase
        .from('modules')
        .select('id, title, description, price')
        .eq('id', moduleId)
        .single();
      module = result.data;
      moduleError = result.error;
    } else if (moduleName) {
      // Chercher par nom
      const result = await supabase
        .from('modules')
        .select('id, title, description, price')
        .eq('title', moduleName)
        .single();
      module = result.data;
      moduleError = result.error;
    } else {
      return NextResponse.json(
        { error: 'Module ID or name is required' },
        { status: 400 }
      );
    }

    if (moduleError || !module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Vérifier si un accès standard existe déjà pour cet utilisateur et ce module
    const { data: existingApplication, error: existingError } = await supabase
      .from('user_applications')
      .select('id, expires_at')
      .eq('user_id', userId)
      .eq('module_title', moduleName)
      .eq('access_level', 'standard')
      .eq('is_active', true)
      .single();

    if (existingApplication) {
      // Si l'accès existe et n'est pas expiré, le retourner
      if (new Date(existingApplication.expires_at) > new Date()) {
        return NextResponse.json({
          success: true,
          application: existingApplication,
          message: 'Existing access found'
        });
      }
    }

    // Créer une entrée dans user_applications pour l'accès standard
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3); // 3 mois
    
    // Définir le quota d'utilisation à 20 pour tous les modules
    const maxUsage = 20;

    const { data: newApplication, error: insertError } = await supabase
      .from('user_applications')
      .insert({
        user_id: userId,
        module_id: module.id.toString(),
        module_title: module.title,
        access_level: 'standard',
        is_active: true,
        expires_at: expiresAt.toISOString(),
        max_usage: maxUsage,
        usage_count: 0
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create access', details: insertError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      application: newApplication,
      message: 'Access created successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}

