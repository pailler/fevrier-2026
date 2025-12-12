import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    console.log('🔄 Activation Administration - userId:', userId);
    
    if (!userId) {
      console.error('❌ Paramètre manquant - userId:', userId);
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }
    
    const supabase = createRouteHandlerClient({ cookies });

    const moduleId = 'administration';
    const moduleTitle = 'Services de l\'Administration';
    const moduleCost = 10; // 10 tokens
    
    // 1. Vérifier si l'utilisateur a déjà accès au module
    const { data: existingAccess, error: fetchAccessError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();
    
    if (fetchAccessError && fetchAccessError.code !== 'PGRST116') {
      console.error('❌ Erreur vérification accès existant:', fetchAccessError);
    }

    if (existingAccess && existingAccess.is_active) {
      console.log('✅ Administration déjà activé');
      return NextResponse.json({ 
        success: true, 
        message: 'Administration déjà activé pour cet utilisateur.', 
        alreadyActivated: true 
      });
    }

    // 2. Vérifier les tokens disponibles
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      console.error('❌ Erreur récupération tokens:', tokenError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la récupération de vos tokens' 
      }, { status: 500 });
    }

    const currentTokens = tokenData.tokens || 0;

    if (currentTokens < moduleCost) {
      return NextResponse.json({ 
        success: false, 
        error: `Tokens insuffisants. Vous avez ${currentTokens} tokens, ${moduleCost} tokens sont requis.` 
      }, { status: 400 });
    }

    // 3. Débiter les tokens
    const newTokenCount = currentTokens - moduleCost;
    const { error: updateTokenError } = await supabase
      .from('user_tokens')
      .update({ tokens: newTokenCount })
      .eq('user_id', userId);

    if (updateTokenError) {
      console.error('❌ Erreur mise à jour tokens:', updateTokenError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la mise à jour de vos tokens' 
      }, { status: 500 });
    }

    // 4. Créer l'accès au module (90 jours pour module essentiel)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 jours (3 mois)

    const { data: accessData, error: createAccessError } = await supabase
      .from('user_applications')
      .insert([{
        user_id: userId,
        module_id: moduleId,
        module_title: moduleTitle,
        is_active: true,
        access_level: 'premium',
        usage_count: 0,
        max_usage: null, // Accès illimité
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createAccessError) {
      console.error('❌ Erreur création accès Administration:', createAccessError);
      console.error('❌ Détails complets de l\'erreur:', JSON.stringify(createAccessError, null, 2));
      
      // Restaurer les tokens en cas d'erreur
      await supabase
        .from('user_tokens')
        .update({ tokens: currentTokens })
        .eq('user_id', userId);
      
      const errorMessage = createAccessError.message || createAccessError.details || createAccessError.hint || 'Erreur inconnue lors de la création de l\'accès';
      
      return NextResponse.json({ 
        success: false, 
        error: `Erreur lors de la création de l'accès Administration: ${errorMessage}`,
        errorDetails: {
          code: createAccessError.code,
          message: createAccessError.message,
          details: createAccessError.details,
          hint: createAccessError.hint
        }
      }, { status: 500 });
    }

    console.log('✅ Accès Administration créé avec succès:', accessData.id);
    console.log(`🪙 Tokens consommés: ${moduleCost}, Restants: ${newTokenCount}`);

    return NextResponse.json({
      success: true,
      message: 'Administration activé avec succès',
      accessId: accessData.id,
      tokensRemaining: newTokenCount
    });

  } catch (error) {
    console.error('❌ Erreur activation Administration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('❌ Détails de l\'erreur:', { message: errorMessage, stack: errorStack });
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'activation de Administration',
      details: errorMessage
    }, { status: 500 });
  }
}

