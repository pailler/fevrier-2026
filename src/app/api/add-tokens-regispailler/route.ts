import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Ajout de crédits pour regispailler...');

    const userId = '77e8d61e-dbec-49fe-bd5a-517fc495c84a';
    
    // Essayer d'insérer des tokens pour l'utilisateur
    const { data: insertData, error: insertError } = await supabase
      .from('user_tokens')
      .upsert([{
        user_id: userId,
        tokens: 20,
        package_name: 'Welcome Package',
        purchase_date: new Date().toISOString(),
        is_active: true
      }], {
        onConflict: 'user_id'
      })
      .select();

    if (insertError) {
      console.error('❌ Erreur insertion tokens:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout des tokens' },
        { status: 500 }
      );
    }

    console.log('✅ Tokens ajoutés avec succès:', insertData);

    return NextResponse.json({
      success: true,
      message: 'Crédits ajoutés avec succès',
      tokens: insertData[0]?.tokens || 20
    });

  } catch (error) {
    console.error('❌ Erreur ajout tokens:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
