const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 8085;

// Configuration Supabase - Charger depuis env.production.local
require('dotenv').config({ path: './env.production.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xemtoyzcihmncbrlsmhr.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M'
);

// Middleware pour parser JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la page d'authentification
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'metube-auth.html'));
});

// API pour vérifier l'utilisateur dans Supabase
app.post('/api/verify-user', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.json({ 
                success: false, 
                error: 'Email et mot de passe requis' 
            });
        }

        console.log('🔍 Vérification utilisateur:', email);

        // Tentative de connexion avec Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (authError || !authData.user) {
            console.log('❌ Utilisateur non trouvé ou mot de passe incorrect');
            return res.json({ 
                success: false, 
                error: 'Email ou mot de passe incorrect',
                redirectTo: 'https://iahome.fr/register?redirect=https://metube.iahome.fr'
            });
        }

        console.log('✅ Utilisateur vérifié:', authData.user.email);
        
        // Vérifier si l'utilisateur a accès à MeTube
        const { data: userApp, error: userAppError } = await supabase
            .from('user_applications')
            .select('*')
            .eq('user_id', authData.user.id)
            .eq('module_id', 'metube')
            .single();

        if (userAppError || !userApp) {
            console.log('❌ Utilisateur sans accès MeTube - Application non activée');
            return res.json({ 
                success: false, 
                error: 'Vous n\'avez pas activé l\'application MeTube dans IAHome. Veuillez vous connecter à IAHome pour l\'activer.',
                redirectTo: 'https://iahome.fr/encours'
            });
        }

        // Vérifier que l'application est bien activée (is_active = true)
        if (!userApp.is_active) {
            console.log('❌ Application MeTube désactivée pour cet utilisateur');
            return res.json({ 
                success: false, 
                error: 'L\'application MeTube est désactivée pour votre compte. Veuillez contacter l\'administrateur.',
                redirectTo: 'https://iahome.fr/encours'
            });
        }

        // Vérifier si l'accès n'est pas expiré
        if (userApp.expires_at && new Date(userApp.expires_at) <= new Date()) {
            console.log('❌ Accès MeTube expiré');
            return res.json({ 
                success: false, 
                error: 'Votre accès à MeTube a expiré. Veuillez contacter l\'administrateur.',
                redirectTo: 'https://iahome.fr/encours'
            });
        }

        // Vérifier le quota d'utilisation
        if (userApp.max_usage && userApp.usage_count >= userApp.max_usage) {
            console.log('❌ Quota MeTube dépassé');
            return res.json({ 
                success: false, 
                error: 'Vous avez atteint votre quota d\'utilisation de MeTube.',
                redirectTo: 'https://iahome.fr/encours'
            });
        }

        console.log('✅ Accès MeTube autorisé');
        
        // Incrémenter le compteur d'utilisation
        const { error: updateError } = await supabase
            .from('user_applications')
            .update({ usage_count: (userApp.usage_count || 0) + 1 })
            .eq('user_id', authData.user.id)
            .eq('module_id', 'metube');

        if (updateError) {
            console.log('⚠️ Erreur incrémentation compteur:', updateError);
        }

        return res.json({ 
            success: true, 
            message: 'Authentification réussie',
            redirectTo: 'http://192.168.1.150:8081'
        });

    } catch (error) {
        console.error('❌ Erreur vérification utilisateur:', error);
        return res.json({ 
            success: false, 
            error: 'Erreur interne du serveur',
            redirectTo: 'https://iahome.fr'
        });
    }
});

// Redirection vers MeTube après authentification
app.get('/metube', (req, res) => {
    res.redirect('http://192.168.1.150:8081');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur d'authentification MeTube démarré sur le port ${PORT}`);
    console.log(`📺 Page d'authentification: http://localhost:${PORT}`);
    console.log(`🔒 L'utilisateur doit s'identifier avant d'accéder à MeTube`);
    console.log(`🔗 Synchronisé avec Supabase pour vérification des utilisateurs`);
});
