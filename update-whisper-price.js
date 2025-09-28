const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.production.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateWhisperPrice() {
  try {
    console.log('🔍 Mise à jour du prix du module Whisper...');
    
    // Mettre à jour le prix du module Whisper
    const { data, error } = await supabase
      .from('modules')
      .update({ 
        price: 9.99,
        category: 'PRODUCTIVITÉ'
      })
      .eq('id', 'whisper')
      .select();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Prix du module Whisper mis à jour:', data[0]);
    } else {
      console.log('⚠️ Aucun module trouvé avec l\'ID "whisper"');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

updateWhisperPrice();


