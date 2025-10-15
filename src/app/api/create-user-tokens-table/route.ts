import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Création de la table user_tokens...');

    // 1. Vérifier si la table existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_tokens')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      ;
      return NextResponse.json({ 
        error: 'Table user_tokens n\'existe pas. Veuillez d\'abord créer la table via l\'interface Supabase.',
        code: 'TABLE_NOT_EXISTS',
        sql: `
-- Créer la table user_tokens
CREATE TABLE IF NOT EXISTS user_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    tokens INTEGER NOT NULL DEFAULT 0,
    package_name VARCHAR(255),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Contrainte unique sur user_id pour éviter les doublons
    UNIQUE(user_id)
);

-- Créer la table token_usage pour l'historique d'utilisation
CREATE TABLE IF NOT EXISTS token_usage (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    module_id VARCHAR(100) NOT NULL,
    module_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(100),
    tokens_consumed INTEGER NOT NULL,
    usage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_active ON user_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_date ON token_usage(usage_date);
        `
      }, { status: 400 });
    }

    ;

    // 2. Tester l'insertion d'un enregistrement de test
    const testUserId = '77e8d61e-dbec-49fe-bd5a-517fc495c84a';
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_tokens')
      .upsert([{
        user_id: testUserId,
        tokens: 10,
        package_name: 'Test Package',
        purchase_date: new Date().toISOString(),
        is_active: true
      }], {
        onConflict: 'user_id'
      })
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
      message: 'Table user_tokens fonctionnelle',
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
