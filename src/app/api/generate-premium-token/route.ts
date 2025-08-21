import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Utiliser la clé anon au lieu de la clé service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { moduleName, userId } = await request.json();

    if (!moduleName || !userId) {
      return NextResponse.json(
        { error: 'Module name and user ID are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Génération token premium pour:', { moduleName, userId });

    // Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('❌ Utilisateur non trouvé:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ Utilisateur trouvé:', user.email);

    // Vérifier que le module existe
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, description, price')
      .eq('title', moduleName)
      .single();

    if (moduleError || !module) {
      console.error('❌ Module non trouvé:', moduleError);
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    console.log('✅ Module trouvé:', module.title);

    // Vérifier si un accès premium existe déjà pour cet utilisateur et ce module
    const { data: existingApplication, error: existingError } = await supabase
      .from('user_applications')
      .select('id, expires_at')
      .eq('user_id', userId)
      .eq('module_title', moduleName)
      .eq('access_level', 'premium')
      .eq('is_active', true)
      .single();

    if (existingApplication) {
      // Si l'accès existe et n'est pas expiré, le retourner
      if (new Date(existingApplication.expires_at) > new Date()) {
        console.log('✅ Accès premium existant trouvé');
        return NextResponse.json({
          success: true,
          application: existingApplication,
          message: 'Existing premium access found'
        });
      }
    }

    // Créer une entrée dans user_applications pour l'accès premium
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3); // 3 mois
    
    // Définir le quota d'utilisation à 20 pour tous les modules
    const maxUsage = 20;

    console.log('🔧 Création de l\'entrée user_applications...');

    console.log('🔧 Création de l\'entrée user_applications...');

    const { data: newApplication, error: insertError } = await supabase
      .from('user_applications')
      .insert({
        user_id: userId,
        module_id: module.id.toString(),
        module_title: module.title,
        access_level: 'premium',
        is_active: true,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erreur création user_application:', insertError);
      return NextResponse.json(
        { error: 'Failed to create premium access', details: insertError },
        { status: 500 }
      );
    }

    console.log('✅ Entrée user_applications créée avec succès:', newApplication);

    return NextResponse.json({
      success: true,
      application: newApplication,
      message: 'Premium access created successfully'
    });

  } catch (error) {
    console.error('❌ Erreur générale dans generate-premium-token:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}

