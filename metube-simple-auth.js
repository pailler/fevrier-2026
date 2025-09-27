const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: './env.production.local' });

// Forcer le chargement des variables d'environnement
console.log('🔧 Variables d\'environnement:');
console.log('• SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Chargée' : '❌ Manquante');
console.log('• SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Chargée' : '❌ Manquante');

const app = express();
const PORT = 8085;

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erreur: Variables Supabase manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware pour parser JSON
app.use(express.json());

// Configuration CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Page d'authentification simple
const authPage = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#667eea">
    <title>Accès à MeTube - IAHome</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            min-height: -webkit-fill-available;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            -webkit-tap-highlight-color: transparent;
        }
        
        .container {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
            font-weight: bold;
        }
        
        h1 {
            color: #333;
            margin-bottom: 0.5rem;
            font-size: 1.5rem;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 2rem;
            font-size: 0.9rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #333;
            font-weight: 500;
        }
        
        input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }
        
        .error {
            background: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 1rem;
            display: none;
        }
        
        .back-link {
            margin-top: 1.5rem;
            color: #667eea;
            text-decoration: none;
            font-size: 0.9rem;
        }
        
        .back-link:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 480px) {
            .container {
                padding: 1.5rem;
                margin: 10px;
                border-radius: 8px;
            }
            
            body {
                padding: 10px;
            }
            
            input {
                font-size: 16px;
                padding: 14px 12px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">📺</div>
        <h1>Accès à MeTube</h1>
        <p class="subtitle">Connectez-vous pour accéder à MeTube</p>
        
        <div class="error" id="error"></div>
        
        <form id="authForm">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="btn" id="submitBtn">Se connecter</button>
        </form>
        
        <a href="https://iahome.fr/card/metube" class="back-link">RDV sur IAHome pour créer un compte gratuit</a>
    </div>

    <script>
        const form = document.getElementById('authForm');
        const errorDiv = document.getElementById('error');
        const submitBtn = document.getElementById('submitBtn');

        function showError(message) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }

        function hideError() {
            errorDiv.style.display = 'none';
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            submitBtn.innerHTML = 'Connexion...';
            submitBtn.disabled = true;

            try {
                console.log('🔐 Tentative de connexion:', email);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch('/api/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                const result = await response.json();
                
                if (result.success) {
                    console.log('✅ Connexion réussie, redirection vers MeTube');
                    window.location.href = result.redirectUrl;
                } else {
                    console.log('❌ Échec de la connexion:', result.error);
                    showError(result.error || 'Erreur de connexion');
                }
            } catch (error) {
                console.error('❌ Erreur:', error);
                let errorMessage = 'Erreur de connexion. Veuillez réessayer.';

                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet.';
                } else if (error.name === 'AbortError') {
                    errorMessage = 'Connexion interrompue. Veuillez réessayer.';
                } else if (error.message.includes('timeout')) {
                    errorMessage = 'Connexion trop lente. Vérifiez votre connexion.';
                }

                showError(errorMessage);
            } finally {
                submitBtn.innerHTML = 'Se connecter';
                submitBtn.disabled = false;
            }
        });
    </script>
</body>
</html>
`;

// Route principale - page d'authentification
app.get('/', (req, res) => {
    console.log('📺 Page d\'authentification demandée');
    res.send(authPage);
});

// API de vérification des identifiants
app.post('/api/verify', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.json({ success: false, error: 'Email et mot de passe requis' });
    }

    try {
        console.log('🔍 Vérification utilisateur:', email);

        // 1. Authentification Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (authError) {
            console.log('❌ Authentification échouée:', authError.message);
            return res.json({ success: false, error: 'Email ou mot de passe incorrect' });
        }

        console.log('✅ Utilisateur authentifié:', email);

        // 2. Vérifier si l'utilisateur a activé MeTube
        const { data: userApps, error: userAppsError } = await supabase
            .from('user_applications')
            .select('*')
            .eq('user_id', authData.user.id)
            .eq('application_name', 'metube')
            .eq('is_active', true);

        if (userAppsError) {
            console.log('❌ Erreur vérification applications:', userAppsError.message);
            return res.json({ success: false, error: 'Erreur de vérification des permissions' });
        }

        if (!userApps || userApps.length === 0) {
            console.log('❌ MeTube non activé pour:', email);
            return res.json({ 
                success: false, 
                error: 'MeTube n\'est pas activé pour votre compte. Veuillez l\'activer sur IAHome.' 
            });
        }

        console.log('✅ Accès autorisé pour:', email);

        // 3. Rediriger vers MeTube
        return res.json({
            success: true,
            redirectUrl: 'https://metube.iahome.fr/metube'
        });

    } catch (error) {
        console.error('❌ Erreur serveur:', error);
        return res.json({ success: false, error: 'Erreur serveur. Veuillez réessayer.' });
    }
});

// Proxy pour MeTube - route /metube
app.use('/metube', createProxyMiddleware({
    target: 'http://192.168.1.150:8082',
    changeOrigin: true,
    pathRewrite: {
        '^/metube': '', // Supprimer /metube du chemin
    },
    onError: (err, req, res) => {
        console.error('❌ Proxy MeTube Error:', err);
        res.status(500).send('Erreur de connexion à MeTube');
    }
}));

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Serveur d\'authentification MeTube démarré');
    console.log(`📺 Page: http://localhost:${PORT}`);
    console.log(`📺 Page: http://192.168.1.150:${PORT}`);
    console.log('🔒 Authentification obligatoire avant MeTube');
    console.log('🔗 Test avec: test@iahome.fr / test123');
});

module.exports = app;
