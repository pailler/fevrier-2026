const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8085;

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
        
        .test-info {
            background: #e8f4fd;
            color: #0066cc;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
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
        
        <div class="test-info">
            <strong>Mode Test :</strong> Utilisez n'importe quel email et mot de passe pour tester
        </div>
        
        <div class="error" id="error"></div>
        
        <form id="authForm">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required placeholder="test@example.com">
            </div>
            
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" name="password" required placeholder="motdepasse">
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

// API de vérification des identifiants (mode test)
app.post('/api/verify', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.json({ success: false, error: 'Email et mot de passe requis' });
    }

    try {
        console.log('🔍 Vérification utilisateur (mode test):', email);

        // Mode test : accepter n'importe quel email/mot de passe
        if (email && password) {
            console.log('✅ Accès autorisé (mode test) pour:', email);

            // Rediriger vers MeTube
            return res.json({
                success: true,
                redirectUrl: 'https://metube.iahome.fr/metube'
            });
        } else {
            return res.json({ success: false, error: 'Email et mot de passe requis' });
        }

    } catch (error) {
        console.error('❌ Erreur serveur:', error);
        return res.json({ success: false, error: 'Erreur serveur. Veuillez réessayer.' });
    }
});

// Middleware pour servir les ressources statiques Angular
app.use((req, res, next) => {
    // Servir les ressources statiques Angular directement
    if (req.url.match(/\.(css|js|webmanifest|png|ico|svg)$/) || 
        req.url.match(/^(styles-|polyfills-|scripts-|main-|ngsw-|custom-)/) ||
        req.url.startsWith('/assets/')) {
        console.log('📁 Servir ressource statique:', req.url);
        
        // Créer un proxy vers la ressource dans MeTube
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
                } else if (req.url.endsWith('.png')) {
                    proxyRes.headers['Content-Type'] = 'image/png';
                } else if (req.url.endsWith('.ico')) {
                    proxyRes.headers['Content-Type'] = 'image/x-icon';
                } else if (req.url.endsWith('.svg')) {
                    proxyRes.headers['Content-Type'] = 'image/svg+xml';
                }
                proxyRes.headers['Cache-Control'] = 'public, max-age=3600';
                proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            }
        });
        return proxy(req, res, next);
    }
    next();
});

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

// Endpoints de fallback pour Angular
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
    console.log('🚀 Serveur d\'authentification MeTube (Mode Test) démarré');
    console.log(`📺 Page: http://localhost:${PORT}`);
    console.log(`📺 Page: http://192.168.1.150:${PORT}`);
    console.log('🔒 Authentification obligatoire avant MeTube (Mode Test)');
    console.log('🔗 Test avec: n\'importe quel email/mot de passe');
});

module.exports = app;
