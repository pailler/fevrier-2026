import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Validate LibreSpeed Token: API appelée');
    
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return new NextResponse('Missing token', { status: 400 });
    }

    // Vérifier si c'est un token provisoire
    if (token.startsWith('prov_')) {
      console.log('🔄 LibreSpeed: Token provisoire détecté');
      
      // Valider le format du token provisoire
      const tokenParts = token.split('_');
      if (tokenParts.length === 3) {
        const timestamp = parseInt(tokenParts[2], 36);
        const now = Date.now();
        const tokenAge = now - timestamp;
        
        // Token provisoire valide pendant 1 heure
        if (tokenAge < 3600000) { // 1 heure en millisecondes
          console.log('✅ LibreSpeed: Token provisoire valide');
          return NextResponse.json({
            valid: true,
            type: 'provisional',
            expiresAt: new Date(timestamp + 3600000).toISOString()
          });
        } else {
          console.log('❌ LibreSpeed: Token provisoire expiré');
          return NextResponse.json({
            valid: false,
            reason: 'Token provisoire expiré'
          });
        }
      } else {
        console.log('❌ LibreSpeed: Format token provisoire invalide');
        return NextResponse.json({
          valid: false,
          reason: 'Format token invalide'
        });
      }
    }

    // Vérifier si c'est un token d'accès existant
    const { data: accessToken, error } = await supabase
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
      .eq('id', token)
      .eq('module_id', 'librespeed')
      .eq('is_active', true)
      .single();

    if (error || !accessToken) {
      console.log('❌ LibreSpeed: Token d\'accès non trouvé');
      return NextResponse.json({
        valid: false,
        reason: 'Token d\'accès non trouvé'
      });
    }

    // Vérifier l'expiration
    if (accessToken.expires_at && new Date(accessToken.expires_at) < new Date()) {
      console.log('❌ LibreSpeed: Token d\'accès expiré');
      return NextResponse.json({
        valid: false,
        reason: 'Token d\'accès expiré'
      });
    }

    // Vérifier le quota d'utilisation
    if (accessToken.max_usage && accessToken.current_usage >= accessToken.max_usage) {
      console.log('❌ LibreSpeed: Quota d\'utilisation dépassé');
      return NextResponse.json({
        valid: false,
        reason: 'Quota d\'utilisation dépassé'
      });
    }

    // Incrémenter le compteur d'utilisation
    const { error: updateError } = await supabase
      .from('access_tokens')
      .update({ 
        current_usage: (accessToken.current_usage || 0) + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', token);

    if (updateError) {
      console.error('❌ LibreSpeed: Erreur mise à jour utilisation:', updateError);
    }

    console.log('✅ LibreSpeed: Token d\'accès valide');
    return NextResponse.json({
      valid: true,
      type: 'access_token',
      token: accessToken,
      usage: {
        current: (accessToken.current_usage || 0) + 1,
        max: accessToken.max_usage
      }
    });

  } catch (error) {
    console.error('❌ Validate LibreSpeed Token Error:', error);
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