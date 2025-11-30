import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email } = body;
    
    console.log('🔄 Activation Home Assistant - userId:', userId, 'email:', email);
    
    if (!userId || !email) {
      console.error('❌ Paramètres manquants - userId:', userId, 'email:', email);
      return NextResponse.json({ success: false, error: 'User ID and email are required' }, { status: 400 });
    }
    
    const supabase = createRouteHandlerClient({ cookies });

    const moduleId = 'home-assistant';
    const moduleTitle = 'Domotisez votre habitat';
    const moduleCost = 100; // 100 tokens
    
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
      console.log('✅ Home Assistant déjà activé, retour à /encours');
      return NextResponse.json({ 
        success: true, 
        message: 'Home Assistant déjà activé pour cet utilisateur.', 
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
      console.error('❌ Erreur création accès Home Assistant:', createAccessError);
      console.error('❌ Détails complets de l\'erreur:', JSON.stringify(createAccessError, null, 2));
      console.error('❌ Code erreur:', createAccessError.code);
      console.error('❌ Message erreur:', createAccessError.message);
      console.error('❌ Détails erreur:', createAccessError.details);
      console.error('❌ Hint erreur:', createAccessError.hint);
      
      // Restaurer les tokens en cas d'erreur
      await supabase
        .from('user_tokens')
        .update({ tokens: currentTokens })
        .eq('user_id', userId);
      
      const errorMessage = createAccessError.message || createAccessError.details || createAccessError.hint || 'Erreur inconnue lors de la création de l\'accès';
      
      return NextResponse.json({ 
        success: false, 
        error: `Erreur lors de la création de l'accès Home Assistant: ${errorMessage}`,
        errorDetails: {
          code: createAccessError.code,
          message: createAccessError.message,
          details: createAccessError.details,
          hint: createAccessError.hint
        }
      }, { status: 500 });
    }

    console.log('✅ Accès Home Assistant créé avec succès:', accessData.id);
    console.log(`🪙 Tokens consommés: ${moduleCost}, Restants: ${newTokenCount}`);

    return NextResponse.json({
      success: true,
      message: 'Home Assistant activé avec succès',
      accessId: accessData.id,
      tokensRemaining: newTokenCount
    });

  } catch (error) {
    console.error('❌ Erreur activation Home Assistant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('❌ Détails de l\'erreur:', { message: errorMessage, stack: errorStack });
    
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'activation de Home Assistant',
      details: errorMessage
    }, { status: 500 });
  }
}

