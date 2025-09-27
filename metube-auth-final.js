const express = require('express');

console.log('🚀 Serveur d\'authentification MeTube - Port 9590');

const app = express();
const PORT = 9590;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Page d'authentification simple
app.get('/', (req, res) => {
    console.log('📺 Page d\'authentification demandée');
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>MeTube Auth</title>
    <style>
        body { font-family: Arial; background: #f0f0f0; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%; }
        .logo { font-size: 2em; color: #1976d2; margin-bottom: 20px; }
        .form-group { margin-bottom: 20px; text-align: left; }
        label { display: block; margin-bottom: 5px; color: #333; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; box-sizing: border-box; }
        .btn { width: 100%; padding: 12px; background: #1976d2; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
        .btn:hover { background: #1565c0; }
        .btn:disabled { background: #ccc; cursor: not-allowed; }
        .error { color: red; margin-top: 10px; }
        .success { color: green; margin-top: 10px; }
        .back-link { margin-top: 20px; }
        .back-link a { color: #1976d2; text-decoration: none; }
        .back-link a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎥 MeTube</div>
        <h2>Authentification requise</h2>
        <form id="authForm">
            <div class="form-group">
                <label>Email:</label>
                <input type="email" id="email" required>
            </div>
            <div class="form-group">
                <label>Mot de passe:</label>
                <input type="password" id="password" required>
            </div>
            <button type="submit" class="btn">Se connecter</button>
            <div id="message"></div>
        </form>
        <div class="back-link">
            <a href="https://iahome.fr/card/metube">RDV sur IAHome pour créer un compte gratuit</a>
        </div>
    </div>
    <script>
        document.getElementById('authForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.querySelector('.btn');
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
</html>`;
    res.send(html);
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
    console.log(`📺 Page: http://localhost:${PORT}`);
    console.log(`📺 Page: http://192.168.1.150:${PORT}`);
    console.log('🔒 Authentification obligatoire avant MeTube (Mode Test)');
    console.log('🔗 Test avec: n\'importe quel email/mot de passe');
    console.log('🎯 MeTube direct: http://192.168.1.150:8082');
});