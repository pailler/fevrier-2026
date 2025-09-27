const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.production.local' });

console.log('🔧 Test d\'authentification Supabase');
console.log('• SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Chargée' : '❌ Manquante');
console.log('• SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Chargée' : '❌ Manquante');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables Supabase manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
    console.log('\n🔐 Test d\'authentification...');
    
    try {
        // Test avec utilisateur de test
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'test@metube.iahome.fr',
            password: 'test123'
        });

        if (authError) {
            console.log('❌ Erreur auth test:', authError.message);
        } else {
            console.log('✅ Auth test réussie:', authData.user.email);
        }
    } catch (error) {
        console.log('❌ Erreur test:', error.message);
    }

    try {
        // Test avec utilisateur réel
        const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
            email: 'regispailler@gmail.com',
            password: 'test123'
        });

        if (authError2) {
            console.log('❌ Erreur auth réel:', authError2.message);
        } else {
            console.log('✅ Auth réel réussie:', authData2.user.email);
        }
    } catch (error) {
        console.log('❌ Erreur test réel:', error.message);
    }

    try {
        // Test avec mot de passe différent
        const { data: authData3, error: authError3 } = await supabase.auth.signInWithPassword({
            email: 'regispailler@gmail.com',
            password: 'password123'
        });

        if (authError3) {
            console.log('❌ Erreur auth password123:', authError3.message);
        } else {
            console.log('✅ Auth password123 réussie:', authData3.user.email);
        }
    } catch (error) {
        console.log('❌ Erreur test password123:', error.message);
    }
}

testAuth();
