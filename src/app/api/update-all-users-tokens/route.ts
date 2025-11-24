import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Mise à jour des tokens pour tous les utilisateurs...');

    // 1. Récupérer tous les utilisateurs
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

    let updatedCount = 0;
    let createdCount = 0;
    const results = [];

    // 2. Traiter chaque utilisateur
    for (const user of users) {
      try {
        // Vérifier si l'utilisateur a déjà des tokens
        const { data: existingTokens } = await supabase
          .from('user_tokens')
          .select('tokens')
          .eq('user_id', user.id)
          .single();

        let tokensToAssign = 100; // 100 tokens par défaut pour tous les utilisateurs

        // Attribuer 20000 tokens à formateur_tic@hotmail.com
        if (user.email === 'formateur_tic@hotmail.com') {
          tokensToAssign = 20000;
          console.log(`🎯 Attribution de 20000 tokens à ${user.email}`);
        }

        if (existingTokens) {
          // Mettre à jour les tokens existants
          const { error: updateError } = await supabase
            .from('user_tokens')
            .update({ 
              tokens: tokensToAssign,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (updateError) {
            console.error(`❌ Erreur mise à jour tokens pour ${user.email}:`, updateError);
            results.push({ email: user.email, status: 'error', message: updateError.message });
          } else {
            console.log(`✅ ${tokensToAssign} tokens mis à jour pour ${user.email}`);
            results.push({ email: user.email, status: 'updated', tokens: tokensToAssign });
            updatedCount++;
          }
        } else {
          // Créer de nouveaux tokens
          const { error: insertError } = await supabase
            .from('user_tokens')
            .insert([{
              user_id: user.id,
              tokens: tokensToAssign,
              package_name: tokensToAssign === 20000 ? 'Premium Package' : 'Welcome Package',
              purchase_date: new Date().toISOString(),
              is_active: true
            }]);

          if (insertError) {
            console.error(`❌ Erreur création tokens pour ${user.email}:`, insertError);
            results.push({ email: user.email, status: 'error', message: insertError.message });
          } else {
            console.log(`✅ ${tokensToAssign} tokens créés pour ${user.email}`);
            results.push({ email: user.email, status: 'created', tokens: tokensToAssign });
            createdCount++;
          }
        }
      } catch (userError) {
        console.error(`❌ Erreur traitement utilisateur ${user.email}:`, userError);
        results.push({ email: user.email, status: 'error', message: 'Erreur inattendue' });
      }
    }

    // 3. Vérifier les résultats finaux
    const { data: finalTokens, error: checkError } = await supabase
      .from('user_tokens')
      .select('user_id, tokens, package_name')
      .order('tokens', { ascending: false });

    if (checkError) {
      console.error('❌ Erreur vérification finale:', checkError);
    }

    console.log('🎯 Mise à jour terminée!');
    console.log(`📊 ${updatedCount} utilisateurs mis à jour, ${createdCount} nouveaux enregistrements`);

    return NextResponse.json({
      success: true,
      message: 'Tokens utilisateur mis à jour avec succès',
      summary: {
        totalUsers: users.length,
        updated: updatedCount,
        created: createdCount,
        errors: results.filter(r => r.status === 'error').length
      },
      results: results,
      finalTokens: finalTokens || []
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour tokens:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}












































