const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: './env.production.local' });

const app = express();
const PORT = 8085;

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Erreur: Variables Supabase manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les assets statiques MeTube
app.use('/metube/assets', createProxyMiddleware({
    target: 'http://192.168.1.150:8082',
    changeOrigin: true,
    pathRewrite: {
        '^/metube': '', // Supprimer /metube du chemin
    },
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('Accept', '*/*');
    },
    onProxyRes: (proxyRes, req, res) => {
        proxyRes.headers['Cache-Control'] = 'public, max-age=3600';
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
}));

// Middleware pour corriger les URLs malformées
app.use((req, res, next) => {
    // Corriger les URLs malformées comme /metubesocket.io/ -> /metube/socket.io/
    if (req.url.startsWith('/metubesocket.io/')) {
        console.log('🔧 Correction URL malformée:', req.url);
        const correctedUrl = req.url.replace('/metubesocket.io/', '/metube/socket.io/');
        return res.redirect(correctedUrl);
    }
    
    // Corriger les URLs malformées comme /metubeversion -> /metube/version
    if (req.url.startsWith('/metubeversion')) {
        console.log('🔧 Correction URL malformée:', req.url);
        const correctedUrl = req.url.replace('/metubeversion', '/metube/version');
        return res.redirect(correctedUrl);
    }
    
    next();
});

// Middleware pour servir les ressources statiques directement
app.use((req, res, next) => {
    // Vérifier si c'est une ressource statique Angular
    if (req.url.match(/\.(css|js|webmanifest)$/) || 
        req.url.match(/^(styles-|polyfills-|scripts-|main-)/)) {
        console.log('📁 Servir ressource statique:', req.url);
        // Créer un proxy vers la ressource dans /metube/
        const proxy = createProxyMiddleware({
            target: 'http://192.168.1.150:8082',
            changeOrigin: true,
            pathRewrite: {
                '^/': '/', // Garder le chemin original
            },
            onProxyReq: (proxyReq, req, res) => {
                proxyReq.setHeader('Accept', '*/*');
            },
            onProxyRes: (proxyRes, req, res) => {
                // Définir le bon type MIME
                if (req.url.endsWith('.css')) {
                    proxyRes.headers['Content-Type'] = 'text/css';
                } else if (req.url.endsWith('.js')) {
                    proxyRes.headers['Content-Type'] = 'application/javascript';
                } else if (req.url.endsWith('.webmanifest')) {
                    proxyRes.headers['Content-Type'] = 'application/manifest+json';
                }
                proxyRes.headers['Cache-Control'] = 'public, max-age=3600';
                proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            }
        });
        return proxy(req, res, next);
    }
    next();
});

// Middleware pour gérer les endpoints de fallback
app.use('/metube/socket.io', (req, res) => {
    console.log('🔌 Socket.io fallback:', req.url);
    res.status(200).json({ 
        message: 'Socket.io not available', 
        status: 'disabled',
        timestamp: new Date().toISOString()
    });
});

app.get('/metube/version', (req, res) => {
    console.log('📋 Version endpoint:', req.url);
    res.status(200).json({ 
        version: '2025.09.06',
        yt_dlp: '2025.09.05',
        status: 'proxy'
    });
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: system-ui, -apple-system, sans-serif; 
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
            margin: 0 auto;
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
        }
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 12px;
            margin: 0 auto 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        h1 { color: #333; margin-bottom: 0.5rem; font-size: 24px; }
        .subtitle { color: #666; font-size: 14px; margin-bottom: 2rem; }
        .form-group { margin-bottom: 1.5rem; }
        label { display: block; margin-bottom: 0.5rem; color: #555; font-weight: 500; }
        input { 
            width: 100%; 
            padding: 12px; 
            border: 2px solid #e1e5e9; 
            border-radius: 8px; 
            font-size: 16px;
            transition: border-color 0.3s;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        @media (max-width: 480px) {
            input {
                font-size: 16px; /* Empêche le zoom sur iOS */
                padding: 14px 12px;
            }
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
        .btn:hover { transform: translateY(-2px); }
        .btn:disabled { 
            opacity: 0.6; 
            cursor: not-allowed; 
            transform: none; 
        }
        .error { 
            background: #fee; 
            color: #c33; 
            padding: 12px; 
            border-radius: 8px; 
            margin-bottom: 1rem; 
            font-size: 14px;
        }
        .success { 
            background: #efe; 
            color: #3c3; 
            padding: 12px; 
            border-radius: 8px; 
            margin-bottom: 1rem; 
            font-size: 14px;
        }
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid #fff;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .links {
            text-align: center;
            margin-top: 1.5rem;
            font-size: 14px;
        }
        .links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 8px;
        }
        .links a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎥</div>
            <h1>Accès à MeTube</h1>
            <p class="subtitle">Connectez-vous avec votre compte IAHome</p>
        </div>
        
        <div id="error" class="error" style="display: none;"></div>
        <div id="success" class="success" style="display: none;"></div>
        
        <form id="authForm">
            <div class="form-group">
                <label for="email">Email IAHome</label>
                <input type="email" id="email" name="email" required placeholder="votre@email.com">
            </div>
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" name="password" required placeholder="••••••••">
            </div>
            <button type="submit" class="btn" id="submitBtn">
                Se connecter
            </button>
        </form>
        
        <div class="links">
            <a href="https://iahome.fr/register" target="_blank">Créer un compte</a>
            <a href="https://iahome.fr" target="_blank">Retour à IAHome</a>
        </div>
    </div>

    <script>
        function showError(message) {
            const errorDiv = document.getElementById('error');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            document.getElementById('success').style.display = 'none';
        }

        function showSuccess(message) {
            const successDiv = document.getElementById('success');
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            document.getElementById('error').style.display = 'none';
        }

        function hideMessages() {
            document.getElementById('error').style.display = 'none';
            document.getElementById('success').style.display = 'none';
        }

        document.getElementById('authForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessages();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = document.getElementById('submitBtn');
            
            if (!email || !password) {
                showError('Veuillez remplir tous les champs');
                return;
            }

            // Afficher le loading
            submitBtn.innerHTML = '<div class="loading"><div class="spinner"></div>Vérification...</div>';
            submitBtn.disabled = true;

            try {
                console.log('🔐 Tentative de connexion:', email);
                
                // Créer un AbortController pour gérer les timeouts
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes
                
                const response = await fetch('/api/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                const result = await response.json();
                
                if (result.success) {
                    console.log('✅ Connexion réussie');
                    showSuccess('Authentification réussie ! Redirection vers MeTube...');
                    
                    setTimeout(() => {
                        window.location.href = result.redirectUrl;
                    }, 1500);
                } else {
                    console.log('❌ Échec:', result.error);
                    showError(result.error);
                    
                    if (result.redirectUrl) {
                        setTimeout(() => {
                            if (confirm('Voulez-vous être redirigé vers la page de création de compte ?')) {
                                window.location.href = result.redirectUrl;
                            }
                        }, 2000);
                    }
                }
            } catch (error) {
                console.error('❌ Erreur:', error);
                let errorMessage = 'Erreur de connexion. Veuillez réessayer.';
                
                // Gestion spécifique des erreurs mobiles
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

// Route principale - Page d'authentification
app.get('/', (req, res) => {
    res.send(authPage);
});

// API de vérification avec Supabase
app.post('/api/verify', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ 
            success: false, 
            error: 'Email et mot de passe requis' 
        });
    }

    try {
        console.log('🔍 Vérification utilisateur:', email);

        // 1. Authentifier l'utilisateur avec Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (authError || !authData.user) {
            console.log('❌ Authentification échouée:', authError?.message);
            return res.json({ 
                success: false, 
                error: 'Email ou mot de passe incorrect',
                redirectUrl: 'https://iahome.fr/register'
            });
        }

        console.log('✅ Utilisateur authentifié:', authData.user.email);

        // 2. Vérifier l'activation MeTube
        const { data: userApp, error: userAppError } = await supabase
            .from('user_applications')
            .select('*')
            .eq('user_id', authData.user.id)
            .eq('module_id', 'metube')
            .single();

        if (userAppError || !userApp) {
            console.log('❌ MeTube non activé');
            return res.json({ 
                success: false, 
                error: 'Vous devez activer MeTube dans IAHome',
                redirectUrl: 'https://iahome.fr/encours'
            });
        }

        // 3. Vérifier que l'app est active
        if (!userApp.is_active) {
            console.log('❌ MeTube désactivé');
            return res.json({ 
                success: false, 
                error: 'MeTube est désactivé pour votre compte',
                redirectUrl: 'https://iahome.fr/encours'
            });
        }

        // 4. Vérifier l'expiration
        if (userApp.expires_at && new Date(userApp.expires_at) <= new Date()) {
            console.log('❌ Accès expiré');
            return res.json({ 
                success: false, 
                error: 'Votre accès à MeTube a expiré',
                redirectUrl: 'https://iahome.fr/encours'
            });
        }

        // 5. Vérifier le quota
        if (userApp.max_usage && userApp.usage_count >= userApp.max_usage) {
            console.log('❌ Quota dépassé');
            return res.json({ 
                success: false, 
                error: 'Quota d\'utilisation dépassé',
                redirectUrl: 'https://iahome.fr/encours'
            });
        }

        console.log('✅ Accès autorisé pour:', authData.user.email);

        // 6. Incrémenter l'utilisation
        await supabase
            .from('user_applications')
            .update({ usage_count: (userApp.usage_count || 0) + 1 })
            .eq('user_id', authData.user.id)
            .eq('module_id', 'metube');

        // 7. Rediriger vers MeTube en production
        return res.json({
            success: true,
            redirectUrl: 'https://metube.iahome.fr/metube'
        });

    } catch (error) {
        console.error('❌ Erreur API:', error);
        return res.json({ 
            success: false, 
            error: 'Erreur interne du serveur' 
        });
    }
});

// Route proxy pour MeTube (après authentification)
app.use('/metube', createProxyMiddleware({
    target: 'http://192.168.1.150:8082',
    changeOrigin: true,
    pathRewrite: {
        '^/metube': '', // Supprimer /metube du chemin
    },
    onProxyReq: (proxyReq, req, res) => {
        // Ajouter des headers pour les ressources statiques
        proxyReq.setHeader('Accept', '*/*');
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (compatible; MeTube-Proxy/1.0)');
    },
    onProxyRes: (proxyRes, req, res) => {
        // Gérer les headers de réponse pour les ressources statiques
        if (req.url.includes('.js') || req.url.includes('.css') || req.url.includes('.png') || req.url.includes('.ico')) {
            proxyRes.headers['Cache-Control'] = 'public, max-age=3600';
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        }
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
