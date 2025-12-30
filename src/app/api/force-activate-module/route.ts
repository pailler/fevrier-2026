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
        message: 'Application déjà activée',
        accessId: existingAccess.id
      });
    }

    // 3. Créer l'accès module
    // Déterminer la durée d'expiration selon le type de module
    const expiresAt = new Date();
    const aiModules = ['whisper', 'stablediffusion', 'ruinedfooocus', 'comfyui', 'hunyuan3d', 'prompt-generator'];
    const isAIModule = aiModules.some(id => moduleId.toLowerCase().includes(id));
    
    // Modules IA : 30 jours (1 mois), Modules essentiels : 90 jours (3 mois)
    if (isAIModule) {
      expiresAt.setDate(expiresAt.getDate() + 30); // 1 mois
    } else {
      expiresAt.setDate(expiresAt.getDate() + 90); // 3 mois
    }

    const { data: accessData, error: accessError } = await supabase
      .from('user_applications')
      .insert({
        user_id: user.id,
        module_id: parseInt(moduleId),
        access_level: 'basic',
        is_active: true,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
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
        expires_at: expiresAt.toISOString(),
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
      message: 'Application activée avec succès',
      accessId: accessData.id,
      tokenId: tokenData?.id,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'activation forcée'
    }, { status: 500 });
  }
}
