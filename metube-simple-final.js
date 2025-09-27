const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: './env.production.local' });

console.log('🚀 Serveur d\'authentification MeTube - Solution Simple');

const app = express();
const PORT = 8085;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Page d'authentification simple
const authPage = <!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#1976d2">
    <title>Authentification MeTube</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .auth-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            width: 100%;
            max-width: 400px;
        }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #1976d2; font-size: 28px; font-weight: 300; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; color: #333; font-weight: 500; }
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
            -webkit-appearance: none;
        }
        .form-group input:focus {
            outline: none;
            border-color: #1976d2;
        }
        .btn {
            width: 100%;
            padding: 12px;
            background: #1976d2;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.3s;
        }
        .btn:hover { background: #1565c0; }
        .btn:disabled { background: #ccc; cursor: not-allowed; }
        .error { color: #f44336; margin-top: 10px; text-align: center; }
        .success { color: #4caf50; margin-top: 10px; text-align: center; }
        @media (max-width: 480px) {
            .auth-container { padding: 30px 20px; }
            .logo h1 { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="logo">
            <h1>🎥 MeTube</h1>
            <p style="color: #666; margin-top: 8px;">Authentification requise</p>
        </div>
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
            <div id="message"></div>
        </form>
    </div>

    <script>
        document.getElementById('authForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            const message = document.getElementById('message');
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Connexion...';
            message.innerHTML = '';

            try {
                const response = await fetch('/api/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    message.innerHTML = '<div class="success">✅ Authentification réussie ! Redirection...</div>';
                    setTimeout(() => {
                        window.location.href = data.redirectUrl;
                    }, 1000);
                } else {
                    message.innerHTML = <div class="error">❌ </div>;
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Se connecter';
                }
            } catch (error) {
                message.innerHTML = '<div class="error">❌ Erreur de connexion</div>';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Se connecter';
            }
        });
    </script>
</body>
</html>;

// Route d'authentification
app.get('/', (req, res) => {
    console.log('📺 Page d\'authentification demandée');
    res.send(authPage);
});

// API de vérification (mode test)
app.post('/api/verify', async (req, res) => {
    const { email, password } = req.body;
    console.log('🔍 Vérification utilisateur (mode test):', email);

    // Mode test : n'importe quel email/mot de passe
    if (email && password) {
        console.log('✅ Accès autorisé (mode test) pour:', email);
        return res.json({
            success: true,
            message: 'Authentification réussie (mode test)',
            redirectUrl: 'https://metube.iahome.fr/metube'
        });
    } else {
        console.log('❌ Authentification échouée (mode test): Email ou mot de passe manquant');
        return res.status(401).json({ 
            success: false, 
            message: 'Email ou mot de passe incorrect' 
        });
    }
});

// Proxy vers MeTube pour /metube
app.use('/metube', createProxyMiddleware({
    target: 'http://192.168.1.150:8082',
    changeOrigin: true,
    pathRewrite: {
        '^/metube': '', // Supprimer /metube du chemin
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('🎥 Proxy MeTube:', req.url);
    },
    onError: (err, req, res) => {
        console.error('❌ Proxy MeTube Error:', err);
        res.status(500).send('Erreur de connexion à MeTube');
    }
}));

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Serveur d\'authentification MeTube démarré');
    console.log(📺 Page: http://localhost:8085);
    console.log(📺 Page: http://192.168.1.150:8085);
    console.log('🔒 Authentification obligatoire avant MeTube (Mode Test)');
    console.log('🔗 Test avec: n\'importe quel email/mot de passe');
    console.log('🎯 MeTube: https://metube.iahome.fr/metube');
});
