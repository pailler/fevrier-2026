const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8084;

// Configuration MeTube (service cible)
const METUBE_TARGET = 'http://192.168.1.150:8081';

// Page d'identification simple
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Accès à MeTube - IAHome</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 min-h-screen flex items-center justify-center">
        <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-gray-800 mb-2">Accès à MeTube</h1>
                <p class="text-gray-600 mb-6">Veuillez vous identifier pour accéder à MeTube</p>
                
                <form id="authForm" class="space-y-4">
                    <div>
                        <input type="email" id="email" placeholder="Votre email" 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                    </div>
                    <div>
                        <input type="password" id="password" placeholder="Votre mot de passe" 
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                    </div>
                    <button type="submit" 
                            class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Se connecter
                    </button>
                </form>
                
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <a href="https://iahome.fr" 
                       class="text-blue-600 hover:text-blue-800 text-sm underline">
                        Retour à IAHome
                    </a>
                </div>
            </div>
        </div>
        
        <script>
            document.getElementById('authForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                if (email && password) {
                    // Simuler une authentification simple
                    console.log('🔐 Tentative de connexion:', email);
                    
                    // Afficher un message de chargement
                    const button = document.querySelector('button[type="submit"]');
                    button.innerHTML = '<div class="flex items-center justify-center"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Connexion...</div>';
                    button.disabled = true;
                    
                    // Simuler un délai d'authentification
                    setTimeout(() => {
                        console.log('✅ Connexion réussie, redirection vers MeTube...');
                        // Rediriger vers MeTube
                        window.location.href = '/metube';
                    }, 1500);
                } else {
                    alert('Veuillez remplir tous les champs');
                }
            });
        </script>
    </body>
    </html>
  `);
});

// Route pour MeTube (après authentification)
app.use('/metube', createProxyMiddleware({
  target: METUBE_TARGET,
  changeOrigin: true,
  pathRewrite: {
    '^/metube': '', // Supprimer /metube du chemin
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('✅ MeTube Auth: Redirection vers MeTube');
  },
  onError: (err, req, res) => {
    console.error('❌ MeTube Auth: Erreur proxy:', err);
    res.status(500).send('Erreur de connexion à MeTube');
  }
}));

// Redirection de la racine vers /metube après authentification
app.get('/metube', (req, res) => {
  res.redirect('/metube/');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MeTube Auth Proxy démarré sur le port ${PORT}`);
  console.log(`📺 MeTube accessible via: http://localhost:${PORT}/metube`);
  console.log(`🔒 Page d'identification requise`);
});
