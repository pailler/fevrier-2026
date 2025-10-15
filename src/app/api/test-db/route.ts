import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test de la base de données LibreSpeed...');

    // 1. Vérifier si le module LibreSpeed existe
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, category, price')
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

    // 2. Créer le module s'il n'existe pas
    if (!moduleData) {
      ;
      
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

    // 3. Lister tous les modules pour vérification
    const { data: allModules, error: allModulesError } = await supabase
      .from('modules')
      .select('id, title, category, price')
      .order('title', { ascending: true });

    if (allModulesError) {
      console.error('❌ Erreur récupération modules:', allModulesError);
      return NextResponse.json({
        success: false,
        error: 'Erreur récupération modules',
        details: allModulesError
      });
    }

    // 4. Vérifier les accès utilisateur
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('id, user_id, module_id, module_title, is_active, usage_count, max_usage')
      .or('module_id.eq.librespeed,module_title.ilike.%librespeed%')
      .limit(10);

    if (accessError) {
      console.log('⚠️ Erreur récupération accès utilisateur:', accessError.message);
    }

    ;

    return NextResponse.json({
      success: true,
      message: 'Test de base de données LibreSpeed réussi',
      data: {
        module: moduleData,
        allModules: allModules?.slice(0, 5), // Premiers 5 modules
        userAccess: userAccess || [],
        stats: {
          totalModules: allModules?.length || 0,
          librespeedAccess: userAccess?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur test base de données:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error
    }, { status: 500 });
  }
}

