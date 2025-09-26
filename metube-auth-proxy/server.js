const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8082; // Port pour le proxy d'authentification

// Middleware
app.use(cookieParser());
app.use(express.json());

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
);

// Configuration MeTube (service cible)
const METUBE_TARGET = 'http://192.168.1.150:8081';

// Middleware pour vérifier l'authentification
async function checkAuthentication(req, res, next) {
  try {
    console.log('🔍 MeTube Auth Proxy: Vérification de l\'authentification...');
    
    // Récupérer le token depuis les cookies ou headers
    const token = req.cookies?.['sb-access-token'] || 
                  req.cookies?.['sb-refresh-token'] ||
                  req.headers.authorization?.replace('Bearer ', '') ||
                  req.query.token;

    if (!token) {
      console.log('❌ MeTube Auth Proxy: Aucun token trouvé');
      return res.redirect(`https://iahome.fr/login?redirect=${encodeURIComponent(req.originalUrl)}`);
    }

    // Vérifier le token avec Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('❌ MeTube Auth Proxy: Token invalide ou utilisateur non trouvé');
      return res.redirect(`https://iahome.fr/login?redirect=${encodeURIComponent(req.originalUrl)}`);
    }

    console.log('✅ MeTube Auth Proxy: Utilisateur authentifié:', user.email);
    
    // Ajouter les informations utilisateur à la requête
    req.user = user;
    next();
    
  } catch (error) {
    console.error('❌ MeTube Auth Proxy Error:', error);
    return res.redirect(`https://iahome.fr/login?redirect=${encodeURIComponent(req.originalUrl)}`);
  }
}

// Page d'authentification pour les utilisateurs non connectés
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
                <p class="text-gray-600 mb-6">Vous devez vous identifier pour accéder à MeTube</p>
                
                <div class="space-y-3">
                    <a href="https://iahome.fr/login?redirect=${encodeURIComponent(req.originalUrl)}" 
                       class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block text-center">
                        Se connecter
                    </a>
                    <a href="https://iahome.fr/register?redirect=${encodeURIComponent(req.originalUrl)}" 
                       class="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium inline-block text-center">
                        Créer un compte
                    </a>
                </div>
                
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <a href="https://iahome.fr" 
                       class="text-blue-600 hover:text-blue-800 text-sm underline">
                        Retour à IAHome
                    </a>
                </div>
            </div>
        </div>
        
        <script>
            // Vérifier si l'utilisateur est déjà connecté
            fetch('https://iahome.fr/api/auth/session', {
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.user) {
                    console.log('✅ Utilisateur déjà connecté, redirection vers MeTube...');
                    window.location.href = '/metube';
                }
            })
            .catch(error => {
                console.log('❌ Vérification de session échouée:', error);
            });
        </script>
    </body>
    </html>
  `);
});

// Route pour MeTube avec authentification
app.use('/metube', checkAuthentication, createProxyMiddleware({
  target: METUBE_TARGET,
  changeOrigin: true,
  pathRewrite: {
    '^/metube': '', // Supprimer /metube du chemin
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('✅ MeTube Auth Proxy: Redirection vers MeTube pour:', req.user.email);
  },
  onError: (err, req, res) => {
    console.error('❌ MeTube Auth Proxy: Erreur proxy:', err);
    res.status(500).send('Erreur de connexion à MeTube');
  }
}));

// Redirection de la racine vers /metube après authentification
app.get('/metube', checkAuthentication, (req, res) => {
  res.redirect('/metube/');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MeTube Auth Proxy démarré sur le port ${PORT}`);
  console.log(`📺 MeTube accessible via: http://localhost:${PORT}/metube`);
  console.log(`🔒 Authentification requise via IAHome`);
});
