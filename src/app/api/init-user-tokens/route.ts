import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Initialisation de la table user_tokens...');

    // 1. Vérifier si la table user_tokens existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_tokens')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      return NextResponse.json({ 
        error: 'Table user_tokens n\'existe pas. Veuillez d\'abord créer la table via l\'interface Supabase.',
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

    let totalCreated = 0;

    // 3. Créer des tokens par défaut pour chaque utilisateur
    for (const user of users) {
      // Vérifier si l'utilisateur a déjà des tokens
      const { data: existingTokens } = await supabase
        .from('user_tokens')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingTokens) {
        // Créer les tokens par défaut
        const { error: insertError } = await supabase
          .from('user_tokens')
          .insert([{
            user_id: user.id,
            tokens: 100, // 100 tokens par défaut
            package_name: 'Welcome Package',
            purchase_date: new Date().toISOString(),
            is_active: true
          }]);

        if (insertError) {
          console.error(`❌ Erreur création tokens pour ${user.email}:`, insertError);
        } else {
          console.log(`✅ 100 tokens créés pour ${user.email}`);
          totalCreated++;
        }
      } else {
        console.log(`⚠️ ${user.email} a déjà des tokens`);
      }
    }

    // 4. Vérifier les données créées
    const { data: tokens, error: checkError } = await supabase
      .from('user_tokens')
      .select('user_id, tokens, package_name');

    if (checkError) {
      console.error('❌ Erreur vérification:', checkError);
    }

    console.log('🎯 Initialisation terminée!');
    console.log(`📊 ${totalCreated} enregistrements de tokens créés`);

    return NextResponse.json({
      success: true,
      message: 'Tokens utilisateur initialisés avec succès',
      totalCreated,
      tokens: tokens || []
    });

  } catch (error) {
    console.error('❌ Erreur initialisation tokens:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
