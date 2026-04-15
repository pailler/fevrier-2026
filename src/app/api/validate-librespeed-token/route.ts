import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 LibreSpeed Token Validation: API appelée');

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    };

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return new NextResponse('Token manquant', {
        status: 400,
        headers: corsHeaders
      });
    }

    // Vérifier le token dans la base de données
    const { data: tokenData, error: tokenError } = await supabase
      .from('librespeed_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (tokenError || !tokenData) {
      ;
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Token invalide'
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Vérifier l'accès utilisateur
    const { data: userApp, error: appError } = await supabase
      .from('user_applications')
      .select('id, usage_count, module_id')
      .eq('user_id', tokenData.user_id)
      .eq('is_active', true)
      .like('module_id', '%librespeed%')
      .single();

    if (appError || !userApp) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'LibreSpeed : aucun accès enregistré pour ce compte'
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const currentUsage = userApp.usage_count || 0;

    return new NextResponse(JSON.stringify({
      success: true,
      magicLinkData: {
        userId: tokenData.user_id,
        userEmail: tokenData.user_email,
        moduleName: 'librespeed',
        token: token,
        expiresAt: tokenData.expires_at,
        usageCount: currentUsage
      }
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ LibreSpeed Token Validation Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}