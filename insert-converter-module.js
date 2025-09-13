const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertConverterModule() {
  try {
    console.log('🔄 Insertion du module Universal Converter...');

    const moduleData = {
      id: 'converter',
      title: 'Universal Converter',
      description: 'Convertisseur universel de fichiers - Transformez vos documents, images, audio et vidéo en toute simplicité. Support de plus de 50 formats de fichiers différents.',
      subtitle: 'Convertissez vos fichiers en un clic - Documents, images, audio, vidéo',
      category: 'Web Tools',
      price: 0,
      youtube_url: '',
      url: 'https://converter.iahome.fr',
      image_url: '/images/converter.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id')
      .eq('id', 'converter')
      .single();

    if (existingModule) {
      console.log('⚠️ Le module converter existe déjà, mise à jour...');
      
      const { data, error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', 'converter')
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        return;
      }

      console.log('✅ Module converter mis à jour avec succès:', data);
    } else {
      // Insérer le nouveau module
      const { data, error } = await supabase
        .from('modules')
        .insert([moduleData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de l\'insertion:', error);
        return;
      }

      console.log('✅ Module converter inséré avec succès:', data);
    }

    // Vérifier que le module est bien dans la liste des modules essentiels
    console.log('🔍 Vérification de la présence dans les modules essentiels...');
    
    const { data: essentialModules, error: essentialError } = await supabase
      .from('modules')
      .select('id, title')
      .in('id', ['librespeed', 'metube', 'pdf', 'psitransfer', 'qrcodes', 'converter']);

    if (essentialError) {
      console.error('❌ Erreur lors de la vérification des modules essentiels:', essentialError);
      return;
    }

    console.log('📋 Modules essentiels trouvés:', essentialModules.map(m => `${m.id} - ${m.title}`));

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter l'insertion
insertConverterModule();
