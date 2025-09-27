const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: './env.production.local' });

console.log('🚀 Serveur d\'authentification MeTube - Port 9590');

const app = express();
const PORT = 9590;

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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .auth-container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        .logo {
            font-size: 2.5em;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        input[type="email"], input[type="password"] {
            width: 100%;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s;
            -webkit-appearance: none;
            appearance: none;
        }
        input[type="email"]:focus, input[type="password"]:focus {
            outline: none;
            border-color: #1976d2;
        }
        .btn {
            width: 100%;
            padding: 15px;
            background: #1976d2;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #1565c0;
        }
        .btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .error {
            color: #f44336;
            margin-top: 10px;
            font-size: 14px;
        }
        .success {
            color: #4caf50;
            margin-top: 10px;
            font-size: 14px;
        }
        .back-link {
            margin-top: 20px;
        }
        .back-link a {
            color: #1976d2;
            text-decoration: none;
            font-size: 14px;
        }
        .back-link a:hover {
            text-decoration: underline;
        }
        @media (max-width: 480px) {
            .auth-container {
                padding: 30px 20px;
                margin: 10px;
            }
            input[type="email"], input[type="password"] {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="logo">🎥 MeTube</div>
        <div class="subtitle">Authentification requise</div>
        
        <form id="authForm">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="btn" id="submitBtn">
                Se connecter
            </button>
            
            <div id="message"></div>
        </form>
        
        <div class="back-link">
            <a href="https://iahome.fr/card/metube">RDV sur IAHome pour créer un compte gratuit</a>
        </div>
    </div>

    <script>
        document.getElementById('authForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const messageDiv = document.getElementById('message');
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Connexion...';
            messageDiv.innerHTML = '';
            
            try {
                const response = await fetch('/api/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    messageDiv.innerHTML = '<div class="success">✅ Authentification réussie ! Redirection...</div>';
                    setTimeout(() => {
                        window.location.href = data.redirectUrl;
                    }, 1000);
                } else {
                    messageDiv.innerHTML = '<div class="error">❌ ' + data.message + '</div>';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Se connecter';
                }
            } catch (error) {
                console.error('Erreur:', error);
                messageDiv.innerHTML = '<div class="error">❌ Erreur de connexion. Veuillez réessayer.</div>';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Se connecter';
            }
        });
    </script>
</body>
</html>;

// Route pour la page d'authentification
app.get('/', (req, res) => {
    console.log('📺 Page d\'authentification demandée');
    res.send(authPage);
});

// API de vérification des identifiants (mode test)
app.post('/api/verify', async (req, res) => {
    const { email, password } = req.body;
    console.log('🔍 Vérification utilisateur (mode test):', email);

    // En mode test, n'importe quel email/mot de passe est accepté
    if (email && password) {
        console.log('✅ Accès autorisé (mode test) pour:', email);
        return res.json({
            success: true,
            message: 'Authentification réussie (mode test)',
            redirectUrl: 'https://metube.iahome.fr/metube'
        });
    } else {
        console.log('❌ Authentification échouée (mode test): Email ou mot de passe manquant');
        return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Serveur d\'authentification MeTube démarré');
    console.log(📺 Page: http://localhost:8085);
    console.log(📺 Page: http://192.168.1.150:8085);
    console.log('🔒 Authentification obligatoire avant MeTube (Mode Test)');
    console.log('🔗 Test avec: n\'importe quel email/mot de passe');
    console.log('🎯 MeTube direct: http://192.168.1.150:8082');
});
