import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
      .select('id, title, description')
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
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3); // 3 mois

    const { data: newApplication, error: insertError } = await supabase
      .from('user_applications')
      .insert({
        user_id: userId,
        module_id: module.id.toString(),
        module_title: module.title,
        access_level: 'premium',
        is_active: true,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user application:', insertError);
      return NextResponse.json(
        { error: 'Failed to create premium access' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      application: newApplication,
      message: 'Premium access created successfully'
    });

  } catch (error) {
    console.error('Error in generate-premium-token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

