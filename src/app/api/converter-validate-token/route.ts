import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return new NextResponse('Bad Request - No token provided', { status: 400 });
    }

    console.log('🔍 Universal Converter - Validation du token:', token);

    // Vérifier le token en base de données
    const { data: tokenData, error } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('jwt_token', token)
      .eq('is_active', true)
      .single();

    if (error || !tokenData) {
      console.log('❌ Universal Converter - Token invalide ou non trouvé');
      return new NextResponse('Unauthorized - Invalid token', { status: 401 });
    }

    // Vérifier si le token n'a pas expiré
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      console.log('❌ Universal Converter - Token expiré');
      return new NextResponse('Unauthorized - Token expired', { status: 401 });
    }

    // Marquer le token comme utilisé
    await supabase
      .from('access_tokens')
      .update({ 
        is_active: false, 
        last_used_at: new Date().toISOString(),
        current_usage: 1
      })
      .eq('id', tokenData.id);

    console.log('✅ Universal Converter - Token validé avec succès pour:', tokenData.description.split('pour ')[1] || 'unknown');

    return NextResponse.json({
      success: true,
      user_id: tokenData.created_by,
      user_email: tokenData.description.split('pour ')[1] || 'unknown',
      module_id: 'converter',
      module_title: 'Universal Converter',
      message: 'Token validé avec succès'
    });

  } catch (error) {
    console.error('❌ Universal Converter - Erreur lors de la validation du token:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
