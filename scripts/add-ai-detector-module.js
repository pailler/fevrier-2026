/**
 * Script pour ajouter le module Détecteur IA dans la base de données
 * 
 * Usage: node scripts/add-ai-detector-module.js
 * 
 * Ce script ajoute le module dans la table 'modules' de Supabase
 * pour qu'il apparaisse dans la page /applications
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non trouvé dans .env.production.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addAIDetectorModule() {
  try {
    console.log('🔄 Ajout du module Détecteur IA...');

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id, title')
      .or('id.eq.ai-detector,title.ilike.%ai-detector%')
      .single();

    if (existingModule && !checkError) {
      console.log('✅ Module Détecteur IA existe déjà:', existingModule);
      return;
    }

    // Créer le module
    const { data: newModule, error: createError } = await supabase
      .from('modules')
      .insert([{
        id: 'ai-detector',
        title: 'Détecteur de Contenu IA',
        description: 'Analysez vos documents texte, PDF, DOCX et images pour détecter la proportion de contenu généré par l\'intelligence artificielle. Détection précise avec scores détaillés et analyse phrase par phrase.',
        category: 'OUTILS IA',
        price: 100,
        url: '/ai-detector',
        image_url: '/images/ai-detector.jpg',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création module:', createError);
      process.exit(1);
    }

    console.log('✅ Module Détecteur IA créé avec succès:', newModule);
    console.log('✅ Le module apparaîtra maintenant dans /applications');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addAIDetectorModule();

