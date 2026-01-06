import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    ;

    // 1. Tester l'accès à la table user_tokens
    const { data: testData, error: testError } = await supabase
      .from('user_tokens')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur accès table user_tokens:', testError);
      return NextResponse.json({
        error: 'Erreur accès table user_tokens',
        details: testError
      }, { status: 500 });
    }

    ;
    console.log('📊 Données de test:', testData);

    // 2. Tester l'insertion d'un enregistrement de test
    const testUserId = '77e8d61e-dbec-49fe-bd5a-517fc495c84a';
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_tokens')
      .insert([{
        user_id: testUserId,
        tokens: 10,
        package_name: 'Test Package',
        purchase_date: new Date().toISOString(),
        is_active: true
      }])
      .select();

    if (insertError) {
      console.error('❌ Erreur insertion test:', insertError);
      return NextResponse.json({
        error: 'Erreur insertion test',
        details: insertError
      }, { status: 500 });
    }

    console.log('✅ Insertion test réussie:', insertData);

    return NextResponse.json({
      success: true,
      message: 'Test de la table user_tokens réussi',
      testData,
      insertData
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return NextResponse.json({
      error: 'Erreur générale',
      details: error.message
    }, { status: 500 });
  }
}
