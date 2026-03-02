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
      .select('id')
      .eq('user_id', userId)
      .eq('module_title', moduleName)
      .eq('access_level', 'premium')
      .eq('is_active', true)
      .single();

    if (existingApplication) {
      return NextResponse.json({
        success: true,
        application: existingApplication,
        message: 'Existing premium access found'
      });
    }

    const now = new Date().toISOString();
    const { data: newApplication, error: insertError } = await supabase
      .from('user_applications')
      .insert({
        user_id: userId,
        module_id: module.id.toString(),
        module_title: module.title,
        access_level: 'premium',
        is_active: true,
        usage_count: 0,
        created_at: now,
        updated_at: now
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

