import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Initialisation des tokens pour tous les utilisateurs...');

    // 1. Récupérer tous les utilisateurs existants
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email');

    if (profilesError) {
      console.error('❌ Erreur récupération profiles:', profilesError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des profils' },
        { status: 500 }
      );
    }

    console.log(`📊 ${profiles?.length || 0} utilisateurs trouvés`);

    let totalCreated = 0;
    let totalUpdated = 0;

    // 2. Pour chaque utilisateur, s'assurer qu'il a des tokens
    for (const profile of profiles || []) {
      try {
        // Vérifier si l'utilisateur a déjà des tokens
        const { data: existingTokens, error: tokenError } = await supabase
          .from('user_tokens')
          .select('id, tokens')
          .eq('user_id', profile.id)
          .single();

        if (tokenError && tokenError.code !== 'PGRST116') {
          console.error(`❌ Erreur vérification tokens pour ${profile.email}:`, tokenError);
          continue;
        }

        if (!existingTokens) {
          // Créer les tokens par défaut
          const { error: insertError } = await supabase
            .from('user_tokens')
            .insert([{
              user_id: profile.id,
              tokens: 10, // 10 tokens par défaut
              package_name: 'Welcome Package',
              purchase_date: new Date().toISOString(),
              is_active: true
            }]);

          if (insertError) {
            console.error(`❌ Erreur création tokens pour ${profile.email}:`, insertError);
          } else {
            console.log(`✅ 10 tokens créés pour ${profile.email}`);
            totalCreated++;
          }
        } else {
          // Vérifier si l'utilisateur a moins de 10 tokens et les compléter
          if (existingTokens.tokens < 10) {
            const { error: updateError } = await supabase
              .from('user_tokens')
              .update({ tokens: 10 })
              .eq('user_id', profile.id);

            if (updateError) {
              console.error(`❌ Erreur mise à jour tokens pour ${profile.email}:`, updateError);
            } else {
              console.log(`✅ Tokens complétés à 10 pour ${profile.email}`);
              totalUpdated++;
            }
          } else {
            console.log(`✅ ${profile.email} a déjà ${existingTokens.tokens} tokens`);
          }
        }
      } catch (error) {
        console.error(`❌ Erreur traitement ${profile.email}:`, error);
      }
    }

    // 3. Vérifier les données finales
    const { data: finalTokens, error: checkError } = await supabase
      .from('user_tokens')
      .select('user_id, tokens, package_name');

    if (checkError) {
      console.error('❌ Erreur vérification finale:', checkError);
    }

    console.log('🎯 Initialisation terminée!');
    console.log(`📊 ${totalCreated} enregistrements créés`);
    console.log(`📊 ${totalUpdated} enregistrements mis à jour`);
    console.log(`📊 ${finalTokens?.length || 0} utilisateurs avec tokens au total`);

    return NextResponse.json({
      success: true,
      message: 'Tokens utilisateur initialisés avec succès',
      totalCreated,
      totalUpdated,
      totalUsers: finalTokens?.length || 0,
      tokens: finalTokens || []
    });

  } catch (error) {
    console.error('❌ Erreur initialisation tokens:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
