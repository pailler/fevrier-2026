// Script pour promouvoir formateur_tic@hotmail.com en admin
// Utilise l'API interne de l'application

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function promoteUserToAdmin() {
    console.log('🔧 Promotion de formateur_tic@hotmail.com en administrateur');
    console.log('=======================================================');
    
    const userEmail = 'formateur_tic@hotmail.com';
    
    try {
        // 1. Rechercher l'utilisateur directement dans la table profiles
        console.log(`\n1. Recherche de l'utilisateur ${userEmail} dans la table profiles...`);
        
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', userEmail);
        
        if (profilesError) {
            throw new Error(`Erreur recherche profiles: ${profilesError.message}`);
        }
        
        if (!profiles || profiles.length === 0) {
            throw new Error(`Utilisateur ${userEmail} non trouvé dans la table profiles`);
        }
        
        const targetProfile = profiles[0];
        
        console.log('✅ Utilisateur trouvé dans profiles:');
        console.log(`   Email: ${targetProfile.email}`);
        console.log(`   ID: ${targetProfile.id}`);
        console.log(`   Rôle actuel: ${targetProfile.role || 'non défini'}`);
        console.log(`   Créé le: ${targetProfile.created_at}`);
        
        // 2. Mettre à jour le rôle en admin
        console.log('\n2. Mise à jour du rôle en admin...');
        
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
                role: 'admin',
                updated_at: new Date().toISOString()
            })
            .eq('id', targetProfile.id)
            .select()
            .single();
        
        if (updateError) {
            throw new Error(`Erreur mise à jour: ${updateError.message}`);
        }
        
        console.log('✅ Rôle admin attribué avec succès!');
        console.log(`   Nouveau rôle: ${updatedProfile.role}`);
        
        // 3. Vérification finale
        console.log('\n3. Vérification finale...');
        
        const { data: finalCheck, error: checkError } = await supabase
            .from('profiles')
            .select('role, email')
            .eq('id', targetProfile.id)
            .single();
        
        if (checkError) {
            throw new Error(`Erreur vérification: ${checkError.message}`);
        }
        
        if (finalCheck.role === 'admin') {
            console.log('✅ Vérification réussie - L\'utilisateur est maintenant admin!');
            console.log(`   Email: ${finalCheck.email}`);
            console.log(`   Rôle: ${finalCheck.role}`);
        } else {
            throw new Error('Échec de la vérification - le rôle n\'est pas admin');
        }
        
        // 5. Afficher les fonctionnalités disponibles
        console.log('\n5. Fonctionnalités admin disponibles:');
        console.log('   • Dashboard admin: /admin/dashboard');
        console.log('   • Gestion utilisateurs: /admin/users');
        console.log('   • Gestion modules: /admin/modules');
        console.log('   • Gestion tokens: /admin/tokens');
        console.log('   • Statistiques: /admin/statistics');
        console.log('   • Gestion paiements: /admin/payments');
        console.log('   • Applications actives: /admin/applications-actives');
        
        console.log('\n🎉 SUCCÈS!');
        console.log(`L'utilisateur ${userEmail} a été promu administrateur avec succès!`);
        console.log('Il peut maintenant accéder à toutes les fonctionnalités d\'administration.');
        
        console.log('\n📋 Instructions pour l\'utilisateur:');
        console.log('1. Se connecter à l\'application avec formateur_tic@hotmail.com');
        console.log('2. Aller sur https://iahome.fr/admin pour accéder au dashboard');
        console.log('3. Toutes les fonctionnalités admin sont maintenant disponibles');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error('Vérifiez la configuration Supabase et les permissions.');
        process.exit(1);
    }
}

// Exécuter le script
promoteUserToAdmin();
