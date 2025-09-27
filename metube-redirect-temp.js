const express = require('express');
const path = require('path');

const app = express();
const PORT = 8087;

// Page de redirection temporaire
const redirectPage = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirection vers l'authentification MeTube</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f3f4f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
        .container { background-color: #ffffff; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center; max-width: 28rem; width: 90%; }
        .icon { width: 4rem; height: 4rem; background-color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
        .icon svg { width: 2rem; height: 2rem; color: white; }
        h1 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem; }
        p { color: #6b7280; margin-bottom: 1.5rem; line-height: 1.5; }
        .button { background-color: #2563eb; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 500; cursor: pointer; transition: background-color 0.2s; text-decoration: none; display: inline-block; margin: 0.5rem; }
        .button:hover { background-color: #1d4ed8; }
        .loading { display: flex; align-items: center; justify-content: center; }
        .spinner { width: 1rem; height: 1rem; border: 2px solid white; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 0.5rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .info { background-color: #f0f9ff; border: 1px solid #0ea5e9; color: #0c4a6e; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; font-size: 0.875rem; }
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
        <p>Redirection vers la page d'authentification...</p>
        
        <div class="info">
            <strong>Configuration temporaire :</strong><br>
            L'authentification MeTube est en cours de configuration.<br>
            Utilisez les liens ci-dessous pour accéder au service.
        </div>
        
        <div>
            <a href="http://192.168.1.150:8085" class="button">
                🔐 Authentification MeTube (Réseau local)
            </a>
            <a href="http://localhost:8085" class="button">
                🔐 Authentification MeTube (Local)
            </a>
        </div>
        
        <p style="margin-top: 1rem; font-size: 0.875rem; color: #6b7280;">
            Redirection automatique dans <span id="countdown">5</span> secondes...
        </p>
    </div>
    
    <script>
        // Compteur de redirection
        let countdown = 5;
        const countdownElement = document.getElementById('countdown');
        
        const timer = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(timer);
                // Redirection vers le serveur d'authentification
                window.location.href = 'http://192.168.1.150:8085';
            }
        }, 1000);
    </script>
</body>
</html>
`;

// Servir la page de redirection
app.get('/', (req, res) => {
    res.send(redirectPage);
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur de redirection temporaire démarré sur le port ${PORT}`);
    console.log(`📺 Page de redirection: http://localhost:${PORT}`);
    console.log(`🔗 Redirige vers le serveur d'authentification sur le port 8085`);
});
