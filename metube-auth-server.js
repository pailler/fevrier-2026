const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './env.production.local' });

const app = express();
const PORT = 8085;

// Configuration Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xemtoyzcihmncbrlsmhr.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGltbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M'
);

// Middleware pour parser JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Page d'authentification
const authPage = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accès à MeTube - IAHome</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; background-color: #f3f4f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background-color: #ffffff; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center; max-width: 28rem; width: 90%; margin: 0 auto; }
        .icon { width: 4rem; height: 4rem; background-color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
        .icon svg { width: 2rem; height: 2rem; color: white; }
        h1 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem; }
        p { color: #6b7280; margin-bottom: 1.5rem; line-height: 1.5; }
        .form-group { margin-bottom: 1rem; }
        input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; }
        input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        button { width: 100%; background-color: #2563eb; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 500; cursor: pointer; transition: background-color 0.2s; }
        button:hover { background-color: #1d4ed8; }
        button:disabled { background-color: #9ca3af; cursor: not-allowed; }
        .link { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; }
        .link a { color: #2563eb; text-decoration: none; font-size: 0.875rem; }
        .link a:hover { color: #1d4ed8; text-decoration: underline; }
        .error-message { background-color: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .success-message { background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .loading { display: flex; align-items: center; justify-content: center; }
        .spinner { width: 1rem; height: 1rem; border: 2px solid white; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 0.5rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
        </div>
        <h1>Accès à MeTube</h1>
        <p>Veuillez vous identifier pour accéder à MeTube</p>
        
        <form id="authForm">
            <div class="form-group">
                <input type="email" id="email" placeholder="Votre email" required>
            </div>
            <div class="form-group">
                <input type="password" id="password" placeholder="Votre mot de passe" required>
            </div>
            <button type="submit">Se connecter</button>
        </form>
        
        <div class="link">
            <a href="https://iahome.fr/register?redirect=https://metube.iahome.fr">
                Créer un compte IAHome
            </a>
        </div>
    </div>
    
    <script>
        document.getElementById('authForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                showError('Veuillez remplir tous les champs');
                return;
            }

            // Afficher un message de chargement
            const button = document.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;
            button.innerHTML = '<div class="loading"><div class="spinner"></div>Vérification...</div>';
            button.disabled = true;

            try {
                console.log('🔐 Tentative de connexion:', email);
                
                // Appeler l'API de vérification Supabase
                const response = await fetch('/api/verify-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();
                
                if (result.success) {
                    console.log('✅ Connexion réussie, redirection vers MeTube...');
                    showSuccess('Authentification réussie ! Redirection...');
                    
                    // Rediriger vers MeTube après un court délai
                    setTimeout(() => {
                        window.location.href = result.redirectTo;
                    }, 1000);
                } else {
                    console.log('❌ Échec de l\'authentification:', result.error);
                    showError(result.error);
                    
                    // Si une redirection est suggérée, l'afficher
                    if (result.redirectTo) {
                        setTimeout(() => {
                            if (confirm('Voulez-vous être redirigé vers la page de création de compte ?')) {
                                window.location.href = result.redirectTo;
                            }
                        }, 2000);
                    }
                }
            } catch (error) {
                console.error('❌ Erreur lors de la vérification:', error);
                showError('Erreur de connexion. Veuillez réessayer.');
            } finally {
                // Restaurer le bouton
                button.innerHTML = originalText;
                button.disabled = false;
            }
        });

        function showError(message) {
            // Supprimer les messages précédents
            const existingError = document.querySelector('.error-message, .success-message');
            if (existingError) {
                existingError.remove();
            }

            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            
            const form = document.getElementById('authForm');
            form.insertBefore(errorDiv, form.firstChild);
        }

        function showSuccess(message) {
            // Supprimer les messages précédents
            const existingError = document.querySelector('.error-message, .success-message');
            if (existingError) {
                existingError.remove();
            }

            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = message;
            
            const form = document.getElementById('authForm');
            form.insertBefore(successDiv, form.firstChild);
        }
    </script>
</body>
</html>
`;

// Servir la page d'authentification
app.get('/', (req, res) => {
    res.send(authPage);
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

        console.log('🔍 Vérification utilisateur dans Supabase:', email);

        // 1. Vérifier que l'utilisateur existe dans Supabase (auth.users)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (authError || !authData.user) {
            console.log('❌ Utilisateur non trouvé dans Supabase ou mot de passe incorrect');
            return res.json({ 
                success: false, 
                error: 'Email ou mot de passe incorrect. Vérifiez vos identifiants.',
                redirectTo: 'https://iahome.fr/register?redirect=https://metube.iahome.fr'
            });
        }

        console.log('✅ Utilisateur trouvé dans Supabase:', authData.user.email, 'ID:', authData.user.id);
        
        // 2. Vérifier que l'utilisateur a activé l'application MeTube dans user_applications
        console.log('🔍 Vérification de l\'activation MeTube pour l\'utilisateur:', authData.user.id);
        const { data: userApp, error: userAppError } = await supabase
            .from('user_applications')
            .select('*')
            .eq('user_id', authData.user.id)
            .eq('module_id', 'metube')
            .single();

        if (userAppError || !userApp) {
            console.log('❌ Application MeTube non trouvée dans user_applications pour l\'utilisateur:', authData.user.id);
            return res.json({ 
                success: false, 
                error: 'Vous n\'avez pas activé l\'application MeTube dans IAHome. Veuillez vous connecter à IAHome pour l\'activer.',
                redirectTo: 'https://iahome.fr/encours'
            });
        }

        console.log('✅ Application MeTube trouvée dans user_applications:', userApp);

        // 3. Vérifier que l'application est bien activée (is_active = true)
        if (!userApp.is_active) {
            console.log('❌ Application MeTube désactivée pour l\'utilisateur:', authData.user.id);
            return res.json({ 
                success: false, 
                error: 'L\'application MeTube est désactivée pour votre compte. Veuillez contacter l\'administrateur.',
                redirectTo: 'https://iahome.fr/encours'
            });
        }

        console.log('✅ Application MeTube activée pour l\'utilisateur:', authData.user.id);

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

        console.log('✅ Accès MeTube autorisé pour:', authData.user.email);
        
        // Incrémenter le compteur d'utilisation
        const { error: incrementError } = await supabase
            .from('user_applications')
            .update({ usage_count: (userApp.usage_count || 0) + 1 })
            .eq('user_id', authData.user.id)
            .eq('module_id', 'metube');

        if (incrementError) {
            console.error('⚠️ Erreur incrémentation compteur:', incrementError);
        } else {
            console.log('✅ Compteur d\'utilisation incrémenté');
        }

        // Rediriger vers MeTube
        return res.json({
            success: true,
            redirectTo: 'https://metube.iahome.fr'
        });

    } catch (error) {
        console.error('❌ Erreur vérification utilisateur:', error);
        return res.json({ 
            success: false, 
            error: 'Erreur interne du serveur. Veuillez réessayer.',
            redirectTo: 'https://iahome.fr/register?redirect=https://metube.iahome.fr'
        });
    }
});

// Redirection vers MeTube après authentification
app.get('/metube', (req, res) => {
    res.redirect('http://192.168.1.150:8081');
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur d'authentification MeTube démarré sur le port ${PORT}`);
    console.log(`📺 Page d'authentification: http://localhost:${PORT}`);
    console.log(`🔒 L'utilisateur doit s'identifier avant d'accéder à MeTube`);
    console.log(`🔗 Synchronisé avec Supabase pour vérification des utilisateurs`);
});