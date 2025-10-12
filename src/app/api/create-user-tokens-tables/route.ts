import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Création de la table user_tokens...');

    // Créer la table user_tokens
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_tokens (
            user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
            tokens INTEGER NOT NULL DEFAULT 10,
            package_name TEXT DEFAULT 'Welcome Package',
            purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (createTableError) {
      console.error('❌ Erreur création table user_tokens:', createTableError);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la table user_tokens' },
        { status: 500 }
      );
    }

    // Créer la table token_usage
    const { error: createUsageTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS token_usage (
            id SERIAL PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            module_id TEXT NOT NULL,
            module_name TEXT NOT NULL,
            action_type TEXT,
            tokens_consumed INTEGER NOT NULL,
            usage_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (createUsageTableError) {
      console.error('❌ Erreur création table token_usage:', createUsageTableError);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la table token_usage' },
        { status: 500 }
      );
    }

    // Créer les index
    const { error: createIndexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
        CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);
        CREATE INDEX IF NOT EXISTS idx_token_usage_date ON token_usage(usage_date);
      `
    });

    if (createIndexError) {
      console.error('❌ Erreur création index:', createIndexError);
      // Ne pas faire échouer pour les index
    }

    // Insérer 10 tokens par défaut pour tous les utilisateurs existants
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');

    if (profilesError) {
      console.error('❌ Erreur récupération profiles:', profilesError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des profils' },
        { status: 500 }
      );
    }

    // Insérer les tokens par défaut pour chaque utilisateur
    const tokenInserts = profiles.map(profile => ({
      user_id: profile.id,
      tokens: 10,
      package_name: 'Welcome Package',
      purchase_date: new Date().toISOString(),
      is_active: true
    }));

    const { error: insertError } = await supabase
      .from('user_tokens')
      .upsert(tokenInserts, {
        onConflict: 'user_id',
        ignoreDuplicates: true
      });

    if (insertError) {
      console.error('❌ Erreur insertion tokens par défaut:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'insertion des tokens par défaut' },
        { status: 500 }
      );
    }

    console.log('✅ Tables user_tokens et token_usage créées avec succès');
    console.log(`✅ ${profiles.length} utilisateurs ont reçu 10 tokens par défaut`);

    return NextResponse.json({
      success: true,
      message: 'Tables créées avec succès',
      usersInitialized: profiles.length
    });

  } catch (error) {
    console.error('❌ Erreur création tables:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
