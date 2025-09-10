const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFormations() {
  try {
    const { data, error } = await supabase
      .from('formation_articles')
      .select('id, title, content')
      .limit(5);
    
    if (error) {
      console.error('Erreur:', error);
      return;
    }
    
    console.log('Formations trouvées:', data?.length || 0);
    data?.forEach((formation, index) => {
      console.log(`\n--- Formation ${index + 1} ---`);
      console.log('Titre:', formation.title);
      console.log('Contenu (premiers 200 chars):', formation.content?.substring(0, 200) + '...');
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
}

checkFormations();
