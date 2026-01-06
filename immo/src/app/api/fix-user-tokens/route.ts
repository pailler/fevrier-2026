import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

/**
 * Route API pour corriger les tokens d'un utilisateur
 * Crée les tokens si l'utilisateur n'en a pas
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email requis' 
      }, { status: 400 });
    }

    console.log(`🔍 Vérification des tokens pour ${email}...`);

    // 1. Récupérer l'UUID de l'utilisateur depuis profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.error(`❌ Utilisateur ${email} non trouvé dans profiles:`, profileError);
      return NextResponse.json({ 
        success: false,
        error: 'Utilisateur non trouvé dans profiles',
        details: profileError?.message
      }, { status: 404 });
    }

    console.log(`✅ Utilisateur trouvé: ${profile.id} (${profile.email})`);

    // 2. Vérifier si l'utilisateur a déjà des tokens
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', profile.id)
      .single();

    if (tokensError && tokensError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (normal si pas de tokens)
      console.error(`❌ Erreur lors de la vérification des tokens:`, tokensError);
      return NextResponse.json({ 
        success: false,
        error: 'Erreur lors de la vérification des tokens',
        details: tokensError.message
      }, { status: 500 });
    }

    // 3. Si l'utilisateur n'a pas de tokens, les créer
    if (!userTokens) {
      console.log(`🪙 Création de 400 tokens pour ${email}...`);
      
      const { data: newTokens, error: createError } = await supabase
        .from('user_tokens')
        .insert([{
          user_id: profile.id,
          tokens: 400, // 400 tokens par défaut pour les nouveaux utilisateurs
          package_name: 'Welcome Package',
          purchase_date: new Date().toISOString(),
          is_active: true
        }])
        .select()
        .single();

      if (createError) {
        console.error(`❌ Erreur lors de la création des tokens:`, createError);
        return NextResponse.json({ 
          success: false,
          error: 'Erreur lors de la création des tokens',
          details: createError.message
        }, { status: 500 });
      }

      console.log(`✅ 400 tokens créés avec succès pour ${email}`);
      
      return NextResponse.json({
        success: true,
        message: 'Tokens créés avec succès',
        user: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name
        },
        tokens: {
          id: newTokens.id,
          tokens: newTokens.tokens,
          package_name: newTokens.package_name,
          is_active: newTokens.is_active
        },
        action: 'created'
      });
    }

    // 4. Si l'utilisateur a déjà des tokens, retourner les informations
    console.log(`✅ L'utilisateur ${email} a déjà ${userTokens.tokens} tokens`);
    
    return NextResponse.json({
      success: true,
      message: 'Utilisateur a déjà des tokens',
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name
      },
      tokens: {
        id: userTokens.id,
        tokens: userTokens.tokens,
        package_name: userTokens.package_name,
        is_active: userTokens.is_active,
        purchase_date: userTokens.purchase_date
      },
      action: 'already_exists'
    });

  } catch (error) {
    console.error('❌ Erreur API fix-user-tokens:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Route GET pour vérifier l'état des tokens d'un utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email requis' 
      }, { status: 400 });
    }

    // 1. Récupérer l'UUID de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ 
        exists: false,
        error: 'Utilisateur non trouvé dans profiles',
        details: profileError?.message
      });
    }

    // 2. Vérifier les tokens
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', profile.id)
      .single();

    if (tokensError && tokensError.code !== 'PGRST116') {
      return NextResponse.json({ 
        exists: false,
        error: 'Erreur lors de la vérification des tokens',
        details: tokensError.message,
        userId: profile.id
      });
    }

    return NextResponse.json({ 
      exists: true,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name
      },
      tokens: userTokens || null,
      hasTokens: !!userTokens
    });

  } catch (error) {
    console.error('❌ Erreur API fix-user-tokens GET:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

