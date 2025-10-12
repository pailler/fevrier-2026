import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Ajout de la colonne tokens à la table profiles...');

    // Ajouter la colonne tokens à la table profiles
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 10;
      `
    });

    if (addColumnError) {
      console.error('❌ Erreur ajout colonne tokens:', addColumnError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout de la colonne tokens' },
        { status: 500 }
      );
    }

    // Mettre à jour tous les utilisateurs existants qui n'ont pas de tokens définis
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE profiles 
        SET tokens = 10 
        WHERE tokens IS NULL;
      `
    });

    if (updateError) {
      console.error('❌ Erreur mise à jour tokens par défaut:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour des tokens par défaut' },
        { status: 500 }
      );
    }

    console.log('✅ Colonne tokens ajoutée à la table profiles avec succès');

    return NextResponse.json({
      success: true,
      message: 'Colonne tokens ajoutée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur ajout colonne tokens:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
