import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Check LibreSpeed Access: API appelée');
    
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return new NextResponse('Missing userId', { status: 400 });
    }

    // Récupérer les tokens d'accès pour LibreSpeed
    const { data: accessTokens, error } = await supabase
      .from('access_tokens')
      .select(`
        id,
        name,
        description,
        module_id,
        module_name,
        access_level,
        permissions,
        max_usage,
        current_usage,
        is_active,
        created_by,
        created_at,
        expires_at
      `)
      .eq('created_by', userId)
      .eq('module_id', 'librespeed')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Check LibreSpeed Access Error:', error);
      return new NextResponse('Database error', { status: 500 });
    }

    console.log('✅ Check LibreSpeed Access: Tokens trouvés:', accessTokens?.length || 0);

    return NextResponse.json({
      hasAccess: (accessTokens?.length || 0) > 0,
      tokens: accessTokens || [],
      count: accessTokens?.length || 0
    });

  } catch (error) {
    console.error('❌ Check LibreSpeed Access Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}