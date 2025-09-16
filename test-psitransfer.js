const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xemtoyzcihmncbrlsmhr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M'
);

async function testPSitransfer() {
  try {
    console.log('🔍 Vérification du module PSitransfer...');
    
    // Vérifier si le module existe
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .or('id.eq.psitransfer,title.ilike.%PSitransfer%')
      .single();
    
    console.log('Module data:', moduleData);
    console.log('Module error:', moduleError);
    
    // Vérifier l'accès utilisateur
    const { data: userAccess, error: accessError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', '4ff83788-7bdb-4633-a693-3ad98006fed5')
      .eq('module_id', 'psitransfer')
      .eq('is_active', true);
    
    console.log('User access:', userAccess);
    console.log('Access error:', accessError);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testPSitransfer();




