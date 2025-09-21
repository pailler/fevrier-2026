const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createLibreSpeedAccess() {
  try {
    console.log('🔧 Création de l\'accès LibreSpeed pour l\'utilisateur...');
    
    const userId = '4ff83788-7bdb-4633-a693-3ad98006fed5';
    
    // Vérifier si l'accès existe déjà
    const { data: existingAccess, error: checkError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', 'librespeed')
      .single();
    
    if (existingAccess) {
      console.log('✅ Accès LibreSpeed existe déjà:', existingAccess);
      return;
    }
    
    // Créer l'accès LibreSpeed
    const { data: newAccess, error: createError } = await supabase
      .from('user_applications')
      .insert([{
        user_id: userId,
        module_id: 'librespeed',
        module_title: 'LibreSpeed',
        is_active: true,
        usage_count: 0,
        max_usage: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erreur création accès:', createError);
      return;
    }
    
    console.log('✅ Accès LibreSpeed créé:', newAccess);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createLibreSpeedAccess();





