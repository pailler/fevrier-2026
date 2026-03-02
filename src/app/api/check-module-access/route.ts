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
      .select('id, usage_count, module_id')
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

    return NextResponse.json({
      success: true,
      tokens: [],
      usage_count: userApp.usage_count
    });

  } catch (error) {
    console.error('❌ Check Module Access Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
