/**
 * Script pour créer le module "Services de l'Administration" directement dans Supabase
 * Usage: node scripts/create-administration-module-direct.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const SUPABASE_URL = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
// Essayer d'abord avec la clé anon, puis service role si nécessaire
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

// Essayer avec service role d'abord, sinon utiliser anon
let supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
let useAnonKey = false;

async function createAdministrationModule() {
  try {
    console.log('🔄 Création du module Services de l\'Administration dans Supabase...');

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id, title')
      .eq('id', 'administration')
      .single();

    if (existingModule) {
      console.log('✅ Module Services de l\'Administration existe déjà:', existingModule.id);
      console.log('📦 Titre:', existingModule.title);
      return {
        success: true,
        message: 'Module Services de l\'Administration existe déjà',
        moduleId: existingModule.id
      };
    }

    // Créer le module
    const { data: newModule, error: createError } = await supabase
      .from('modules')
      .insert([{
        id: 'administration',
        title: 'Services de l\'Administration',
        description: 'Portail centralisé pour accéder rapidement aux principaux services de l\'administration française : CAF, Sécurité Sociale, permis de conduire, aides sociales, scolarité, études, retraites, famille, handicap et bien plus.',
        category: 'SERVICES PUBLICS',
        price: 10,
        url: '/administration',
        image_url: '/images/administration-module.jpg',
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      // Si erreur de clé API avec service role, essayer avec anon key
      if (createError.message.includes('API key') && !useAnonKey) {
        console.log('⚠️ Erreur avec service role key, tentative avec anon key...');
        useAnonKey = true;
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Réessayer avec anon key
        const { data: newModuleRetry, error: createErrorRetry } = await supabase
          .from('modules')
          .insert([{
            id: 'administration',
            title: 'Services de l\'Administration',
            description: 'Portail centralisé pour accéder rapidement aux principaux services de l\'administration française : CAF, Sécurité Sociale, permis de conduire, aides sociales, scolarité, études, retraites, famille, handicap et bien plus.',
            category: 'SERVICES PUBLICS',
            price: 10,
            url: '/administration',
            image_url: '/images/administration-module.jpg',
            is_visible: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
          
        if (createErrorRetry) {
          console.error('❌ Erreur création module (après retry):', createErrorRetry);
          return {
            success: false,
            error: 'Erreur lors de la création du module',
            details: createErrorRetry.message
          };
        }
        
        newModule = newModuleRetry;
      } else {
        console.error('❌ Erreur création module:', createError);
        return {
          success: false,
          error: 'Erreur lors de la création du module',
          details: createError.message
        };
      }
    }

    console.log('✅ Module Services de l\'Administration créé avec succès!');
    console.log('📦 Module ID:', newModule.id);
    console.log('📦 Titre:', newModule.title);

    return {
      success: true,
      message: 'Module Services de l\'Administration créé avec succès',
      module: newModule
    };

  } catch (error) {
    console.error('❌ Erreur lors de la création du module:', error);
    return {
      success: false,
      error: 'Erreur serveur lors de la création du module',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Exécuter le script
createAdministrationModule()
  .then(result => {
    if (result.success) {
      console.log('✅ Succès:', result.message);
      process.exit(0);
    } else {
      console.error('❌ Erreur:', result.error);
      if (result.details) {
        console.error('📋 Détails:', result.details);
      }
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erreur inattendue:', error);
    process.exit(1);
  });
