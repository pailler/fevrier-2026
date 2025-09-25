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
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
    <style>
        /* Tailwind CSS inline pour éviter le CDN en production */
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;line-height:1.5}
        .min-h-screen{min-height:100vh}
        .bg-gradient-to-br{background:linear-gradient(to bottom right,var(--tw-gradient-stops))}
        .from-blue-50{--tw-gradient-from:#eff6ff;--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to,rgba(239,246,255,0))}
        .to-purple-50{--tw-gradient-to:#faf5ff}
        .flex{display:flex}
        .items-center{align-items:center}
        .justify-center{justify-content:center}
        .text-center{text-align:center}
        .w-16{width:4rem}
        .h-16{height:4rem}
        .bg-blue-600{background-color:#2563eb}
        .bg-red-600{background-color:#dc2626}
        .bg-green-50{background-color:#f0fdf4}
        .bg-red-50{background-color:#fef2f2}
        .bg-pink-50{background-color:#fdf2f8}
        .bg-white{background-color:#fff}
        .bg-gray-50{background-color:#f9fafb}
        .bg-gray-100{background-color:#f3f4f6}
        .bg-gray-200{background-color:#e5e7eb}
        .bg-blue-500{background-color:#3b82f6}
        .bg-green-500{background-color:#22c55e}
        .bg-red-500{background-color:#ef4444}
        .rounded-full{border-radius:9999px}
        .rounded-lg{border-radius:0.5rem}
        .rounded-md{border-radius:0.375rem}
        .mx-auto{margin-left:auto;margin-right:auto}
        .mb-4{margin-bottom:1rem}
        .mb-2{margin-bottom:0.5rem}
        .mb-3{margin-bottom:0.75rem}
        .mb-6{margin-bottom:1.5rem}
        .mt-6{margin-top:1.5rem}
        .mt-4{margin-top:1rem}
        .p-4{padding:1rem}
        .p-6{padding:1.5rem}
        .p-3{padding:0.75rem}
        .px-4{padding-left:1rem;padding-right:1rem}
        .py-2{padding-top:0.5rem;padding-bottom:0.5rem}
        .py-4{padding-top:1rem;padding-bottom:1rem}
        .py-8{padding-top:2rem;padding-bottom:2rem}
        .text-white{color:#fff}
        .text-gray-900{color:#111827}
        .text-gray-600{color:#4b5563}
        .text-gray-700{color:#374151}
        .text-gray-800{color:#1f2937}
        .text-blue-900{color:#1e3a8a}
        .text-blue-700{color:#1d4ed8}
        .text-green-900{color:#14532d}
        .text-green-700{color:#15803d}
        .text-green-600{color:#16a34a}
        .text-red-700{color:#b91c1c}
        .text-sm{font-size:0.875rem;line-height:1.25rem}
        .text-xs{font-size:0.75rem;line-height:1rem}
        .text-lg{font-size:1.125rem;line-height:1.75rem}
        .text-xl{font-size:1.25rem;line-height:1.75rem}
        .text-2xl{font-size:1.5rem;line-height:2rem}
        .text-3xl{font-size:1.875rem;line-height:2.25rem}
        .font-semibold{font-weight:600}
        .font-bold{font-weight:700}
        .font-medium{font-weight:500}
        .w-8{width:2rem}
        .h-8{height:2rem}
        .w-6{width:1.5rem}
        .h-6{height:1.5rem}
        .w-3{width:0.75rem}
        .h-3{height:0.75rem}
        .w-2{width:0.5rem}
        .h-2{height:0.5rem}
        .w-10{width:2.5rem}
        .h-10{height:2.5rem}
        .animate-pulse{animation:pulse 2s cubic-bezier(0.4,0,0.6,1) infinite}
        .hover\\:bg-blue-700:hover{background-color:#1d4ed8}
        .hover\\:bg-green-700:hover{background-color:#16a34a}
        .hover\\:bg-red-600:hover{background-color:#dc2626}
        .transition-colors{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}
        .shadow-sm{box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)}
        .shadow-md{box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)}
        .shadow-lg{box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)}
        .border{border-width:1px}
        .border-gray-200{border-color:#e5e7eb}
        .border-gray-300{border-color:#d1d5db}
        .border-red-400{border-color:#f87171}
        .border-green-400{border-color:#4ade80}
        .border-t{border-top-width:1px}
        .border-b{border-bottom-width:1px}
        .max-w-7xl{max-width:80rem}
        .max-w-full{max-width:100%}
        .grid{display:grid}
        .grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}
        .grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
        .gap-4{gap:1rem}
        .gap-6{gap:1.5rem}
        .space-x-2>:not([hidden])~:not([hidden]){margin-left:0.5rem}
        .space-x-3>:not([hidden])~:not([hidden]){margin-left:0.75rem}
        .space-x-4>:not([hidden])~:not([hidden]){margin-left:1rem}
        .space-y-4>:not([hidden])~:not([hidden]){margin-top:1rem}
        .flex-grow{flex-grow:1}
        .flex-col{flex-direction:column}
        .justify-between{justify-content:space-between}
        .items-start{align-items:flex-start}
        .truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .block{display:block}
        .hidden{display:none}
        .relative{position:relative}
        .absolute{position:absolute}
        .top-0{top:0}
        .right-0{right:0}
        .w-full{width:100%}
        .h-auto{height:auto}
        .cursor-pointer{cursor:pointer}
        .cursor-not-allowed{cursor:not-allowed}
        .select-none{user-select:none}
        .outline-none{outline:2px solid transparent;outline-offset:2px}
        .focus\\:outline-none:focus{outline:2px solid transparent;outline-offset:2px}
        .focus\\:ring-2:focus{box-shadow:0 0 0 2px var(--tw-ring-color)}
        .focus\\:ring-blue-500:focus{--tw-ring-color:#3b82f6}
        .disabled\\:opacity-50:disabled{opacity:0.5}
        .disabled\\:cursor-not-allowed:disabled{cursor:not-allowed}
        @media (min-width:768px){.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media (min-width:1024px){.lg\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media (min-width:640px){.sm\\:inline{display:inline}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    </style>
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

        // Vérifier la session utilisateur via l'API
        async function checkUser() {
            try {
                // Récupérer le token depuis l'URL
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');
                
                if (token) {
                    console.log('🔑 Token trouvé:', token.substring(0, 10) + '...');
                    
                    // Vérifier le token via l'API
                    const response = await fetch(\`https://iahome.fr/api/qr-session?sessionId=\${token}\`);
                    
                    if (response.ok) {
                        const sessionData = await response.json();
                        console.log('✅ Session validée:', sessionData);
                        
                        // Simuler un utilisateur pour l'affichage
                        const user = {
                            id: sessionData.userId || 'unknown',
                            email: sessionData.userEmail || 'utilisateur@iahome.fr',
                            last_sign_in_at: new Date().toISOString()
                        };
                        
                        showQRInterface(user);
                    } else {
                        console.log('❌ Token invalide');
                        showLoginRequired();
                    }
                } else {
                    console.log('❌ Aucun token fourni');
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
