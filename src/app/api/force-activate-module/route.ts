import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, moduleId, moduleTitle } = await request.json();

    if (!userEmail || !moduleId || !moduleTitle) {
      return NextResponse.json({ 
        success: false, 
        error: 'userEmail, moduleId et moduleTitle requis' 
      }, { status: 400 });
    }

    // 1. Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 });
    }

    // 2. Vérifier si l'accès existe déjà
    const { data: existingAccess, error: checkError } = await supabase
      .from('user_applications')
      .select('id')
      .eq('user_id', user.id)
      .eq('module_id', parseInt(moduleId))
      .eq('is_active', true)
      .single();

    if (existingAccess) {
      return NextResponse.json({ 
        success: true, 
        message: 'Cette appli est déjà enregistrée sur votre compte',
        accessId: existingAccess.id
      });
    }

    const now = new Date().toISOString();
    const { data: accessData, error: accessError } = await supabase
      .from('user_applications')
      .insert({
        user_id: user.id,
        module_id: parseInt(moduleId).toString(),
        module_title: moduleTitle,
        access_level: 'basic',
        is_active: true,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (accessError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la création de l\'accès module' 
      }, { status: 500 });
    }

    // 4. Créer un token d'accès
    const { data: tokenData, error: tokenError } = await supabase
      .from('access_tokens')
      .insert({
        name: `Token ${moduleTitle}`,
        description: `Accès forcé à ${moduleTitle}`,
        module_id: parseInt(moduleId),
        module_name: moduleTitle,
        created_by: user.id,
        access_level: 'basic',
        permissions: ['access'],
        max_usage: 1000,
        current_usage: 0,
        is_active: true,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (tokenError) {
      // On continue même si le token n'est pas créé
    } else {
      }

    // 5. Enregistrer un paiement factice pour la traçabilité
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        session_id: `force_activation_${Date.now()}`,
        customer_email: userEmail,
        amount: 0,
        currency: 'eur',
        status: 'succeeded',
        module_id: moduleId,
        metadata: {
          force_activation: true,
          activated_at: new Date().toISOString(),
          reason: 'Force activation via API'
        }
      });

    if (paymentError) {
      }

    return NextResponse.json({
      success: true,
      message: 'Accès ouvert sur votre compte',
      accessId: accessData.id,
      tokenId: tokenData?.id
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'activation forcée'
    }, { status: 500 });
  }
}
