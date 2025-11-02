import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { moduleId, moduleName, userId, userEmail, moduleCost, moduleDescription } = body;

    if (!moduleId || !moduleName || !userId || !userEmail || moduleCost === undefined) {
      return NextResponse.json(
        { error: 'Paramètres requis manquants' },
        { status: 400 }
      );
    }

    console.log(`🔄 Activation module: ${moduleName} (${moduleId}) pour ${userEmail}`);

    // 1. Vérifier que l'utilisateur existe
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      console.error('❌ Utilisateur non trouvé:', userId);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // 2. Vérifier les tokens disponibles
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens')
      .eq('user_id', userId)
      .single();

    if (tokensError || !userTokens) {
      // L'utilisateur n'a pas de tokens, il doit passer par les achats
      console.log('❌ Activation module: Utilisateur sans tokens:', userEmail);
      return NextResponse.json(
        { 
          error: 'Tokens insuffisants',
          currentTokens: 0,
          requiredTokens: moduleCost,
          insufficient: true,
          message: 'Vous devez acheter des tokens pour activer ce module'
        },
        { status: 400 }
      );
    }

    const currentTokens = userTokens.tokens || 0;

    // 3. Vérifier si l'utilisateur a assez de tokens
    if (currentTokens < moduleCost) {
      return NextResponse.json(
        { 
          error: 'Tokens insuffisants',
          currentTokens: currentTokens,
          requiredTokens: moduleCost,
          insufficient: true
        },
        { status: 400 }
      );
    }

    // 4. Vérifier si le module est déjà activé
    const { data: existingAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .single();

    if (!accessError && existingAccess) {
      return NextResponse.json(
        { 
          error: 'Module déjà activé',
          alreadyActivated: true
        },
        { status: 400 }
      );
    }

    // 5. Consommer les tokens
    const newTokenCount = currentTokens - moduleCost;
    
    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({ tokens: newTokenCount })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Erreur lors de la mise à jour des tokens:', updateError);
      return NextResponse.json(
        { 
          error: 'Plus de tokens ? Rechargez',
          message: 'Plus de tokens ? Rechargez',
          pricingUrl: 'https://iahome.fr/pricing'
        },
        { status: 500 }
      );
    }

    // 6. Activer le module dans user_applications
    // Définir une expiration de 1 mois (30 jours) pour tous les modules
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 1 mois
    
    const { error: activationError } = await supabase
      .from('user_applications')
      .insert([{
        user_id: userId,
        module_id: moduleId,
        module_title: moduleName,
        access_level: 'premium',
        is_active: true,
        expires_at: expiresAt.toISOString(), // Expiration dans 1 mois
        usage_count: 0,
        max_usage: null, // Pas de limite d'usage
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (activationError) {
      console.error('Erreur lors de l\'activation du module:', activationError);
      
      // Restaurer les tokens en cas d'erreur
      await supabase
        .from('user_tokens')
        .update({ tokens: currentTokens })
        .eq('user_id', userId);
      
      return NextResponse.json(
        { error: 'Erreur lors de l\'activation du module' },
        { status: 500 }
      );
    }

    console.log(`✅ Module ${moduleName} activé avec succès pour ${userEmail}`);
    console.log(`🪙 Tokens consommés: ${moduleCost}, Restants: ${newTokenCount}`);

    return NextResponse.json({
      success: true,
      message: `Module ${moduleName} activé avec succès`,
      tokensConsumed: moduleCost,
      tokensRemaining: newTokenCount,
      moduleId,
      moduleName,
      activationDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur activation module:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}