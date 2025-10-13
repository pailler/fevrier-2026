const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateAdminRole() {
  console.log('🔍 Vérification et mise à jour du rôle administrateur...');
  
  const adminEmail = 'formateur_tic@hotmail.com';
  
  try {
    // Récupérer l'utilisateur par email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (profileError) {
      console.error('❌ Erreur lors de la récupération du profil:', profileError);
      return;
    }

    if (!profile) {
      console.error('❌ Profil non trouvé pour:', adminEmail);
      return;
    }

    console.log('✅ Profil trouvé:', {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name
    });

    // Vérifier si le rôle est déjà admin
    if (profile.role === 'admin') {
      console.log('✅ Le rôle est déjà "admin"');
      return;
    }

    // Mettre à jour le rôle vers admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', profile.id);

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour du rôle:', updateError);
    } else {
      console.log('✅ Rôle mis à jour vers "admin" pour:', adminEmail);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

updateAdminRole();
