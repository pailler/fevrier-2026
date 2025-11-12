import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Création des tables de notifications...');

    // SQL pour créer la table notification_settings
    const createSettingsTableSQL = `
      CREATE TABLE IF NOT EXISTS notification_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        is_enabled BOOLEAN DEFAULT true,
        email_template_subject TEXT NOT NULL,
        email_template_body TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // SQL pour créer la table notification_logs
    const createLogsTableSQL = `
      CREATE TABLE IF NOT EXISTS notification_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        event_data JSONB,
        email_sent BOOLEAN DEFAULT false,
        email_error TEXT,
        email_sent_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // SQL pour créer les index
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_notification_logs_event_type ON notification_logs(event_type);
      CREATE INDEX IF NOT EXISTS idx_notification_logs_user_email ON notification_logs(user_email);
      CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_notification_settings_event_type ON notification_settings(event_type);
      CREATE INDEX IF NOT EXISTS idx_notification_settings_enabled ON notification_settings(is_enabled);
    `;

    // SQL pour créer la fonction de mise à jour automatique de updated_at
    const createUpdateTriggerSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
      CREATE TRIGGER update_notification_settings_updated_at
        BEFORE UPDATE ON notification_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    // Exécuter les requêtes SQL
    const { error: settingsError } = await supabase.rpc('exec_sql', { 
      sql: createSettingsTableSQL 
    });

    if (settingsError) {
      console.error('❌ Erreur lors de la création de notification_settings:', settingsError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la création de la table notification_settings',
        details: settingsError.message
      }, { status: 500 });
    }

    const { error: logsError } = await supabase.rpc('exec_sql', { 
      sql: createLogsTableSQL 
    });

    if (logsError) {
      console.error('❌ Erreur lors de la création de notification_logs:', logsError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la création de la table notification_logs',
        details: logsError.message
      }, { status: 500 });
    }

    const { error: indexError } = await supabase.rpc('exec_sql', { 
      sql: createIndexesSQL 
    });

    if (indexError) {
      console.error('❌ Erreur lors de la création des index:', indexError);
      // Ne pas échouer pour les index
    }

    const { error: triggerError } = await supabase.rpc('exec_sql', { 
      sql: createUpdateTriggerSQL 
    });

    if (triggerError) {
      console.error('❌ Erreur lors de la création du trigger:', triggerError);
      // Ne pas échouer pour le trigger
    }

    ;

    return NextResponse.json({
      success: true,
      message: 'Tables de notifications créées avec succès',
      tables: ['notification_settings', 'notification_logs'],
      indexes: ['event_type', 'user_email', 'created_at', 'is_enabled'],
      trigger: 'update_updated_at_column'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
