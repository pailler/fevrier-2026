const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 7005;
const PUBLIC_DIR = __dirname;

const server = http.createServer((req, res) => {
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
    
    // Si pas de fichier, servir une page par défaut
    if (!fs.existsSync(filePath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(\
<!DOCTYPE html>
<html>
<head>
    <title>qrcodes - Service</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { color: #28a745; font-size: 24px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>qrcodes</h1>
        <div class="status">✅ Service actif sur le port 7005</div>
        <p>Service qrcodes démarré avec succès via Cloudflare.</p>
        <p>Accès via: <strong>https://qrcodes.iahome.fr</strong></p>
    </div>
</body>
</html>
        \);
        return;
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
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

    let contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(\$(System.Collections.Hashtable.Name) server running at http://localhost:\/\);
});
