import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, moduleId } = body;
    
    if (!userId || !moduleId) {
      return new NextResponse('Missing userId or moduleId', { status: 400 });
    }

    // Vérifier si l'utilisateur a le module activé
    const { data: userApps, error: appError } = await supabase
      .from('user_applications')
      .select('id, usage_count, max_usage, expires_at, module_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .like('module_id', `%${moduleId}%`);

    if (appError || !userApps || userApps.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Module not activated for user'
      }, { status: 403 });
    }

    const userApp = userApps[0]; // Prendre le premier résultat

    // Vérifier l'expiration
    if (userApp.expires_at && new Date(userApp.expires_at) < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Access expired'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      tokens: [], // Pas de tokens d'accès pour l'instant
      usage_count: userApp.usage_count,
      max_usage: userApp.max_usage
    });

  } catch (error) {
    console.error('❌ Check Module Access Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
