import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Création des tables pour les services administratifs...');

    // SQL pour créer la table administration_categories
    const createCategoriesTableSQL = `
      CREATE TABLE IF NOT EXISTS administration_categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        icon VARCHAR(50) NOT NULL,
        color VARCHAR(100) NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // SQL pour créer la table administration_services
    const createServicesTableSQL = `
      CREATE TABLE IF NOT EXISTS administration_services (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        category_id UUID NOT NULL REFERENCES administration_categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        icon VARCHAR(50),
        is_popular BOOLEAN DEFAULT false,
        app_store_url TEXT,
        play_store_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // SQL pour créer la table administration_url_checks (pour le monitoring)
    const createUrlChecksTableSQL = `
      CREATE TABLE IF NOT EXISTS administration_url_checks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        service_id UUID NOT NULL REFERENCES administration_services(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        status_code INTEGER,
        is_valid BOOLEAN DEFAULT true,
        error_message TEXT,
        response_time_ms INTEGER,
        last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // SQL pour créer les index
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_admin_categories_name ON administration_categories(name);
      CREATE INDEX IF NOT EXISTS idx_admin_categories_order ON administration_categories(display_order);
      CREATE INDEX IF NOT EXISTS idx_admin_services_category ON administration_services(category_id);
      CREATE INDEX IF NOT EXISTS idx_admin_services_order ON administration_services(display_order);
      CREATE INDEX IF NOT EXISTS idx_admin_url_checks_service ON administration_url_checks(service_id);
      CREATE INDEX IF NOT EXISTS idx_admin_url_checks_last_checked ON administration_url_checks(last_checked_at);
      CREATE INDEX IF NOT EXISTS idx_admin_url_checks_valid ON administration_url_checks(is_valid);
    `;

    // Vérifier si les tables existent déjà en essayant de les interroger
    const { error: testError } = await supabase
      .from('administration_categories')
      .select('id')
      .limit(1);

    if (testError) {
      // Table n'existe pas ou erreur - retourner les instructions SQL
      if (testError.code === '42P01' || testError.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          message: 'Les tables n\'existent pas encore. Veuillez exécuter ces requêtes SQL dans Supabase SQL Editor:',
          sql: [
            createCategoriesTableSQL,
            createServicesTableSQL,
            createUrlChecksTableSQL,
            createIndexesSQL
          ].join('\n\n')
        }, { status: 200 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tables créées avec succès ou déjà existantes'
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de la création des tables:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Erreur lors de la création des tables. Veuillez vérifier les logs.'
    }, { status: 500 });
  }
}

