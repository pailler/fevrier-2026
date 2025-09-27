const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.production.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Test de connexion Supabase...');
console.log('• URL:', supabaseUrl ? '✅ Définie' : '❌ Manquante');
console.log('• Key:', supabaseAnonKey ? '✅ Définie' : '❌ Manquante');

if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Variables d\'environnement manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        console.log('🔍 Test de connexion à Supabase...');
        
        // Test simple de connexion
        const { data, error } = await supabase
            .from('user_applications')
            .select('count')
            .limit(1);

        if (error) {
            console.log('❌ Erreur Supabase:', error.message);
            return;
        }

        console.log('✅ Connexion Supabase réussie');
        console.log('• Données récupérées:', data);

        // Test d'authentification avec un utilisateur
        console.log('🔍 Test d\'authentification...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'formateur_tic@hotmail.com',
            password: 'test123'
        });

        if (authError) {
            console.log('❌ Erreur authentification:', authError.message);
        } else {
            console.log('✅ Authentification réussie:', authData.user.email);
        }

    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

testConnection();
