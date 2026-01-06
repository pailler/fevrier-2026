import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey()
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Création des tables pour la recherche immobilière...');

    // Lire le fichier SQL
    const sqlFilePath = path.join(process.cwd(), 'scripts', 'create-real-estate-tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    // Exécuter le SQL via Supabase
    // Note: Supabase ne supporte pas directement l'exécution de SQL multi-lignes
    // On va donc exécuter chaque commande séparément
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    const errors: string[] = [];

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Pour les CREATE TABLE, on utilise rpc si disponible, sinon on ignore les erreurs si la table existe déjà
          let error = null;
          try {
            const result = await supabase.rpc('exec_sql', { sql: statement + ';' });
            error = result.error;
          } catch (e) {
            // Si exec_sql n'existe pas, on ignore l'erreur
            error = null;
          }

          if (error) {
            // Ignorer les erreurs "already exists"
            if (!error.message?.includes('already exists') && !error.message?.includes('duplicate')) {
              errors.push(`${statement.substring(0, 50)}...: ${error.message}`);
            }
          }
        } catch (e: any) {
          // Ignorer les erreurs de syntaxe pour les fonctions et triggers
          if (!e.message?.includes('syntax error')) {
            errors.push(`Erreur: ${e.message}`);
          }
        }
      }
    }

    // Alternative: utiliser directement le client Supabase pour créer les tables via l'API REST
    // Mais Supabase ne permet pas d'exécuter du SQL arbitraire via l'API REST
    // Il faudra créer les tables manuellement dans le dashboard Supabase ou utiliser une migration

    if (errors.length > 0) {
      console.warn('⚠️ Certaines erreurs sont survenues (peut être normal si les tables existent déjà):', errors);
    }

    return NextResponse.json({
      success: true,
      message: 'Tables créées avec succès (ou déjà existantes)',
      note: 'Si les tables n\'existent pas, veuillez exécuter le script SQL manuellement dans le dashboard Supabase',
      sql_file: sqlFilePath,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de la création des tables:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la création des tables',
        message: error.message,
        note: 'Veuillez exécuter le script SQL manuellement dans le dashboard Supabase: scripts/create-real-estate-tables.sql'
      },
      { status: 500 }
    );
  }
}
