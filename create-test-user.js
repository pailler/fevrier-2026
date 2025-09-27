const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.production.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Variables d\'environnement manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
    try {
        console.log('🔍 Création d\'un utilisateur de test...');
        
        // Créer un utilisateur de test
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: 'test@metube.iahome.fr',
            password: 'test123456',
            options: {
                data: {
                    full_name: 'Test MeTube User'
                }
            }
        });

        if (authError) {
            console.log('❌ Erreur création utilisateur:', authError.message);
            return;
        }

        console.log('✅ Utilisateur créé:', authData.user.email);
        console.log('• ID:', authData.user.id);

        // Attendre un peu pour que l'utilisateur soit créé
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Créer l'entrée dans user_applications
        const { data: userAppData, error: userAppError } = await supabase
            .from('user_applications')
            .insert({
                user_id: authData.user.id,
                module_id: 'metube',
                is_active: true,
                max_usage: 100,
                usage_count: 0,
                expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 an
            })
            .select();

        if (userAppError) {
            console.log('❌ Erreur création user_applications:', userAppError.message);
        } else {
            console.log('✅ User application créée:', userAppData);
        }

        console.log('');
        console.log('🎉 Utilisateur de test créé avec succès !');
        console.log('• Email: test@metube.iahome.fr');
        console.log('• Mot de passe: test123456');
        console.log('• Module MeTube activé');

    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

createTestUser();
