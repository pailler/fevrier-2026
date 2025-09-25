const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Page QR codes directe
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Codes - IAHome</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <div id="app">
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Chargement de votre interface QR codes</h2>
                <p class="text-gray-600">Veuillez patienter...</p>
            </div>
        </div>
    </div>

    <script>
        // Configuration Supabase
        const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ0MDAsImV4cCI6MjA1MDU1MDQwMH0.8KqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';
        const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

        // Vérifier la session utilisateur
        async function checkUser() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user) {
                    console.log('✅ Utilisateur connecté:', session.user.email);
                    showQRInterface(session.user);
                } else {
                    console.log('❌ Aucun utilisateur connecté');
                    showLoginRequired();
                }
            } catch (error) {
                console.error('❌ Erreur vérification utilisateur:', error);
                showError('Erreur lors de la vérification de votre session');
            }
        }

        // Afficher l'interface QR codes
        function showQRInterface(user) {
            document.getElementById('app').innerHTML = \`
                <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
                    <!-- Header avec utilisateur connecté -->
                    <div class="bg-white shadow-sm border-b">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div class="flex justify-between items-center py-4">
                                <div class="flex items-center space-x-4">
                                    <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 class="text-2xl font-bold text-gray-900">Générateur de QR Codes</h1>
                                        <p class="text-sm text-gray-600">Interface de gestion des QR codes dynamiques</p>
                                    </div>
                                </div>
                                
                                <!-- Affichage de l'utilisateur connecté -->
                                <div class="flex items-center space-x-3">
                                    <div class="text-right">
                                        <p class="text-sm font-medium text-gray-900">Connecté en tant que :</p>
                                        <p class="text-sm text-gray-600">\${user.email}</p>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span class="text-xs text-green-600 font-medium">Session active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Contenu principal -->
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div class="bg-white rounded-lg shadow-sm border p-6">
                            <h2 class="text-lg font-semibold text-gray-900 mb-4">Interface QR Codes</h2>
                            <p class="text-gray-600 mb-4">Bienvenue dans votre interface de gestion des QR codes !</p>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="bg-blue-50 p-4 rounded-lg">
                                    <h3 class="font-medium text-blue-900 mb-2">QR Codes Statiques</h3>
                                    <p class="text-sm text-blue-700 mb-3">Générez des QR codes simples pour vos URLs</p>
                                    <button onclick="window.open('https://qrcodes.iahome.fr/static', '_blank')" 
                                            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                                        Accéder aux QR codes statiques
                                    </button>
                                </div>
                                
                                <div class="bg-green-50 p-4 rounded-lg">
                                    <h3 class="font-medium text-green-900 mb-2">QR Codes Dynamiques</h3>
                                    <p class="text-sm text-green-700 mb-3">Créez des QR codes avec suivi et analytics</p>
                                    <button onclick="window.open('https://qrcodes.iahome.fr/dynamic', '_blank')" 
                                            class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                                        Accéder aux QR codes dynamiques
                                    </button>
                                </div>
                            </div>
                            
                            <div class="mt-6 pt-6 border-t">
                                <h3 class="font-medium text-gray-900 mb-3">Informations de session</h3>
                                <div class="bg-gray-50 p-3 rounded-md">
                                    <p class="text-sm text-gray-600"><strong>Email:</strong> \${user.email}</p>
                                    <p class="text-sm text-gray-600"><strong>ID:</strong> \${user.id}</p>
                                    <p class="text-sm text-gray-600"><strong>Dernière connexion:</strong> \${new Date(user.last_sign_in_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
        }

        // Afficher page de connexion requise
        function showLoginRequired() {
            document.getElementById('app').innerHTML = \`
                <div class="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 class="text-xl font-semibold text-gray-900 mb-2">Connexion requise</h2>
                        <p class="text-gray-600 mb-4">Vous devez être connecté pour accéder aux QR codes</p>
                        <button onclick="window.location.href='https://iahome.fr/login'" 
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Se connecter
                        </button>
                    </div>
                </div>
            \`;
        }

        // Afficher erreur
        function showError(message) {
            document.getElementById('app').innerHTML = \`
                <div class="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 class="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
                        <p class="text-gray-600 mb-4">\${message}</p>
                        <button onclick="window.location.reload()" 
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Réessayer
                        </button>
                    </div>
                </div>
            \`;
        }

        // Démarrer l'application
        checkUser();
    </script>
</body>
</html>
  `);
});

// Redirection vers l'interface QR codes
app.get('/qrcodes-direct', (req, res) => {
  res.redirect('/');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'qr-codes' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Service QR Codes démarré sur le port ${PORT}`);
});
