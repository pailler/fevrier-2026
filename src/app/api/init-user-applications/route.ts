import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Initialisation des applications utilisateur...');

    // 1. Vérifier si la table user_applications existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_applications')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      return NextResponse.json({ 
        error: 'Table user_applications n\'existe pas. Veuillez d\'abord créer la table via l\'interface Supabase.',
        code: 'TABLE_NOT_EXISTS'
      }, { status: 400 });
    }

    // 2. Récupérer tous les utilisateurs via la table profiles
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email');

    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError);
      return NextResponse.json({ error: 'Erreur récupération utilisateurs' }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Aucun utilisateur trouvé' }, { status: 404 });
    }

    console.log(`📊 ${users.length} utilisateurs trouvés`);

    // 3. Modules gratuits à ajouter pour tous les utilisateurs
    const freeModules = [
      { id: 'librespeed', title: 'LibreSpeed', maxUsage: 10 },
      { id: 'pdf', title: 'PDF+', maxUsage: 5 },
      { id: 'metube', title: 'Metube', maxUsage: 3 },
      { id: 'psitransfer', title: 'PSitransfer', maxUsage: 5 }
    ];

    let totalCreated = 0;

    // 4. Ajouter les applications pour chaque utilisateur
    for (const user of users) {
      for (const module of freeModules) {
        // Vérifier si l'application existe déjà
        const { data: existing } = await supabase
          .from('user_applications')
          .select('id')
          .eq('user_id', user.id)
          .eq('module_id', module.id)
          .single();

        if (!existing) {
          // Créer l'application
          const { error: insertError } = await supabase
            .from('user_applications')
            .insert([{
              user_id: user.id,
              module_id: module.id,
              module_title: module.title,
              access_level: 'standard',
              is_active: true,
              expires_at: null, // Pas d'expiration
              usage_count: 0,
              max_usage: module.maxUsage
            }]);

          if (insertError) {
            console.error(`❌ Erreur création ${module.id} pour ${user.email}:`, insertError);
          } else {
            console.log(`✅ ${module.title} ajouté pour ${user.email}`);
            totalCreated++;
          }
        }
      }
    }

    // 5. Vérifier les données créées
    const { data: applications, error: checkError } = await supabase
      .from('user_applications')
      .select('module_id, module_title');

    if (checkError) {
      console.error('❌ Erreur vérification:', checkError);
    }

    console.log('🎯 Initialisation terminée!');
    console.log(`📊 ${totalCreated} applications créées`);

    return NextResponse.json({
      success: true,
      message: 'Applications utilisateur initialisées avec succès',
      totalCreated,
      applications: applications || []
    });

  } catch (error) {
    console.error('❌ Erreur initialisation:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'initialisation',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
