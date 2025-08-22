import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email utilisateur requis' },
        { status: 400 }
      );
    }

    // 1. Récupérer l'ID de l'utilisateur depuis la table profiles
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', userEmail)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // 2. Récupérer tous les tokens d'accès actifs pour cet utilisateur
    const { data: tokensData, error: tokensError } = await supabase
      .from('access_tokens')
      .select(`
        *,
        modules:module_id (
          id,
          title,
          description,
          category,
          price,
          youtube_url,
          url,
          created_at,
          updated_at
        )
      `)
      .eq('created_by', userProfile.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (tokensError) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des tokens' },
        { status: 500 }
      );
    }

    // 3. Transformer les données pour correspondre au format attendu par la page encours
    const transformedTokens = (tokensData || []).map(token => ({
      id: token.id,
      name: token.name,
      description: token.description,
      module_id: token.module_id,
      module_name: token.module_name,
      access_level: token.access_level,
      permissions: token.permissions || ['access'],
      max_usage: token.max_usage,
      current_usage: token.current_usage || 0,
      is_active: token.is_active,
      created_by: token.created_by,
      created_at: token.created_at,
      expires_at: token.expires_at,
      jwt_token: token.jwt_token,
      last_used_at: token.last_used_at,
      usage_log: token.usage_log || [],
      access_type: 'premium',
      metadata: {},
      // Ajouter les informations du module
      modules: token.modules ? {
        id: token.modules.id,
        title: token.modules.title,
        description: token.modules.description,
        category: token.modules.category,
        price: token.modules.price,
        youtube_url: token.modules.youtube_url,
        url: token.modules.url,
        created_at: token.modules.created_at,
        updated_at: token.modules.updated_at
      } : null,
      // Ajouter les statistiques calculées
      token: {
        id: token.id,
        name: token.name,
        description: token.description,
        module_id: token.module_id,
        module_name: token.module_name,
        access_level: token.access_level,
        permissions: token.permissions || ['access'],
        max_usage: token.max_usage,
        current_usage: token.current_usage || 0,
        is_active: token.is_active,
        created_by: token.created_by,
        created_at: token.created_at,
        expires_at: token.expires_at,
        jwt_token: token.jwt_token,
        last_used_at: token.last_used_at,
        usage_log: token.usage_log || []
      }
    }));

    return NextResponse.json({
      success: true,
      tokens: transformedTokens,
      user: {
        id: userProfile.id,
        email: userProfile.email
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
