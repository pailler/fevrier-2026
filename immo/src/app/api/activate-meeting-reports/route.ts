import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { moduleId, userId, moduleTitle, moduleDescription, moduleCategory, moduleUrl } = await request.json();

    if (!moduleId || !userId) {
      return NextResponse.json(
        { error: 'Module ID et User ID requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, tokens')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a suffisamment de tokens (100 tokens requis)
    if (user.tokens < 100) {
      return NextResponse.json(
        { error: 'Tokens insuffisants. 100 tokens requis pour activer ce module.' },
        { status: 400 }
      );
    }

    // Vérifier si le module est déjà activé
    const { data: existingActivation, error: checkError } = await supabase
      .from('user_modules')
      .select('id')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Erreur lors de la vérification du module' },
        { status: 500 }
      );
    }

    if (existingActivation) {
      return NextResponse.json(
        { error: 'Application déjà activée' },
        { status: 400 }
      );
    }

    // Activer le module
    const { data: activation, error: activationError } = await supabase
      .from('user_modules')
      .insert({
        user_id: userId,
        module_id: moduleId,
        module_title: moduleTitle,
        module_description: moduleDescription,
        module_category: moduleCategory,
        module_url: moduleUrl,
        activated_at: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (activationError) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'activation du module' },
        { status: 500 }
      );
    }

    // Déduire 100 tokens de l'utilisateur
    const { error: tokenError } = await supabase
      .from('users')
      .update({ tokens: user.tokens - 100 })
      .eq('id', userId);

    if (tokenError) {
      // Si la déduction des tokens échoue, annuler l'activation
      await supabase
        .from('user_modules')
        .delete()
        .eq('id', activation.id);

      return NextResponse.json(
        { error: 'Erreur lors de la déduction des tokens' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application Meeting Reports activée avec succès',
      activation: activation,
      tokensRemaining: user.tokens - 100
    });

  } catch (error) {
    console.error('Erreur lors de l\'activation du module meeting-reports:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
