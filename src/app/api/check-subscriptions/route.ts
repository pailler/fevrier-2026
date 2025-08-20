import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API check-subscriptions appelée');
    
    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('module');
    const userId = searchParams.get('userId');

    console.log('🔍 Paramètres reçus:', { moduleName, userId });

    // Validation des paramètres
    if (!userId) {
      console.error('❌ Paramètres manquants');
      return NextResponse.json(
        { error: 'Paramètres manquants: userId requis' },
        { status: 400 }
      );
    }

    // Récupérer les modules depuis user_applications
    console.log('🔍 Récupération des modules depuis user_applications...');
    const { data: userModules, error: modulesError } = await supabase
      .from('user_applications')
      .select(`
        id,
        module_id,
        module_title,
        access_level,
        expires_at,
        is_active,
        created_at
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (modulesError) {
      console.error('❌ Erreur user_applications:', modulesError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des modules utilisateur' },
        { status: 500 }
      );
    }

    // Récupérer les tokens d'accès
    console.log('🔍 Récupération des tokens d\'accès...');
    const { data: accessTokens, error: tokensError } = await supabase
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
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (tokensError) {
      console.error('❌ Erreur access_tokens:', tokensError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des tokens d\'accès' },
        { status: 500 }
      );
    }

    // Transformer les modules user_applications
    const transformedModules = (userModules || [])
      .filter(access => {
        if (!access || !access.id) return false;
        if (!access.expires_at) return true;
        try {
          return new Date(access.expires_at) > new Date();
        } catch (error) {
          return true;
        }
      })
      .map(access => ({
        id: access.id,
        type: 'module',
        module_id: access.module_id,
        title: access.module_title || `Module ${access.module_id}`,
        access_level: access.access_level || 'basic',
        expires_at: access.expires_at,
        created_at: access.created_at
      }));

    // Transformer les tokens d'accès
    const transformedTokens = (accessTokens || [])
      .filter(token => {
        if (!token || !token.id) return false;
        if (!token.expires_at) return true;
        try {
          return new Date(token.expires_at) > new Date();
        } catch (error) {
          return true;
        }
      })
      .map(token => ({
        id: `token-${token.id}`,
        type: 'token',
        module_id: token.module_id,
        title: token.name || token.module_name || `Token ${token.id}`,
        access_level: token.access_level || 'standard',
        expires_at: token.expires_at,
        created_at: token.created_at,
        current_usage: token.current_usage || 0,
        max_usage: token.max_usage
      }));

    // Combiner les deux listes
    const allAccess = [...transformedModules, ...transformedTokens];
    const hasActiveSubscription = allAccess.length > 0;

    console.log('✅ Résultat vérification:', { 
      hasActiveSubscription, 
      modulesCount: transformedModules.length,
      tokensCount: transformedTokens.length,
      totalCount: allAccess.length
    });

    return NextResponse.json({
      hasActiveSubscription,
      activeAccess: allAccess,
      modules: transformedModules,
      tokens: transformedTokens,
      totalActiveModules: allAccess.length
    });

  } catch (error) {
    console.error('❌ Erreur check-subscriptions:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la vérification' },
      { status: 500 }
    );
  }
} 