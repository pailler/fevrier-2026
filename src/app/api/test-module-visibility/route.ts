import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test de la visibilité du module LibreSpeed...');

    // 1. Vérifier la structure de la table modules
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'modules')
      .order('ordinal_position');

    if (columnsError) {
      console.log('❌ Erreur récupération structure table:', columnsError.message);
    } else {
      console.log('✅ Structure de la table modules:', columns);
    }

    // 2. Vérifier si le module LibreSpeed existe
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, category, price, is_visible')
      .or('id.eq.librespeed,title.ilike.%librespeed%')
      .single();

    if (moduleError) {
      console.log('❌ Module LibreSpeed non trouvé:', moduleError.message);
      return NextResponse.json({
        success: false,
        error: 'Module LibreSpeed non trouvé',
        details: moduleError
      });
    }

    console.log('✅ Module LibreSpeed trouvé:', moduleData);

    // 3. Créer le module s'il n'existe pas
    if (!moduleData) {
      console.log('📝 Création du module LibreSpeed...');
      
      const { data: newModule, error: createError } = await supabase
        .from('modules')
        .insert([{
          id: 'librespeed',
          title: 'LibreSpeed',
          description: 'Test de vitesse internet rapide et précis.',
          subtitle: 'Test de vitesse internet',
          category: 'WEB TOOLS',
          price: 0,
          url: '/librespeed-interface',
          image_url: '/images/librespeed.jpg',
          is_visible: true, // Visible par défaut
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur création module:', createError);
        return NextResponse.json({
          success: false,
          error: 'Erreur création module',
          details: createError
        });
      }

      console.log('✅ Module LibreSpeed créé:', newModule);
    }

    // 4. Tester la visibilité du module
    const isVisible = moduleData?.is_visible !== false;
    console.log('🔍 Module LibreSpeed visible:', isVisible);

    // 5. Simuler la vérification pour un utilisateur de test
    const testUserId = 'test-user-id';
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, user_id, module_id, module_title, is_active, expires_at')
      .eq('user_id', testUserId)
      .eq('module_id', moduleData.id)
      .eq('is_active', true)
      .single();

    if (accessError) {
      console.log('⚠️ Aucun accès utilisateur trouvé (normal pour le test)');
    }

    console.log('✅ Test de visibilité terminé avec succès');

    return NextResponse.json({
      success: true,
      message: 'Test de visibilité du module LibreSpeed réussi',
      data: {
        module: moduleData,
        isVisible: isVisible,
        userAccess: userAccess || null,
        tableStructure: columns || [],
        testResults: {
          moduleExists: !!moduleData,
          moduleVisible: isVisible,
          userHasAccess: !!userAccess
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur test visibilité module:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error
    }, { status: 500 });
  }
}

