import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId, email } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  if (!userId || !email) {
    return NextResponse.json({ success: false, error: 'User ID and email are required' }, { status: 400 });
  }

  const moduleId = 'photobooth';
  const moduleTitle = 'Photobooth événements';

  try {
    const { data: existingAccessList } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .eq('is_active', true);

    const { data: existingAccessByTitle } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .ilike('module_title', '%Photobooth%')
      .eq('is_active', true);

    const existingAccess = existingAccessList?.[0] || existingAccessByTitle?.[0];
    if (existingAccess) {
      return NextResponse.json({
        success: true,
        message: 'Photobooth déjà enregistré sur ce compte.',
        accessId: existingAccess.id,
        alreadyActivated: true,
      });
    }

    const now = new Date().toISOString();
    const { data: accessData, error: createAccessError } = await supabase
      .from('user_applications')
      .insert([
        {
          user_id: userId,
          module_id: moduleId,
          module_title: moduleTitle,
          is_active: true,
          access_level: 'premium',
          usage_count: 0,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (createAccessError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de la création de l\'accès Photobooth',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Photobooth activé avec succès',
      accessId: accessData.id,
      moduleId,
      moduleTitle,
      accessData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      },
      { status: 500 }
    );
  }
}
