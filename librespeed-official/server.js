// Serveur LibreSpeed simple avec Node.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8081;

// Types MIME
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Route par défaut
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Chemin du fichier
    const filePath = path.join(__dirname, pathname);
    
    // Vérifier si le fichier existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Fichier non trouvé
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 - LibreSpeed</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #e74c3c; }
                    </style>
                </head>
                <body>
                    <h1 class="error">404 - Fichier non trouvé</h1>
                    <p>Le fichier demandé n'existe pas.</p>
                    <a href="/">Retour à LibreSpeed</a>
                </body>
                </html>
            `);
            return;
        }
        
        // Lire le fichier
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>Erreur serveur</h1>');
                return;
            }
            
            // Déterminer le type MIME
            const ext = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            
            // Headers CORS pour permettre l'accès depuis Cloudflare
            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Cache-Control': 'no-cache'
            });
            
            res.end(data);
        });
    });
});

// Gestion des erreurs
server.on('error', (err) => {
    console.error('Erreur serveur:', err);
});

// Démarrage du serveur
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LibreSpeed officiel démarré sur le port ${PORT}`);
    console.log(`🌐 URL locale: http://localhost:${PORT}`);
    console.log(`🌍 URL publique: https://librespeed.iahome.fr`);
    console.log(`📊 Prêt pour les tests de vitesse!`);
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du serveur LibreSpeed...');
    server.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
    });
});





