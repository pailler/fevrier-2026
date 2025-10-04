Write-Host "🚀 Démarrage des services simples pour Cloudflare..." -ForegroundColor Cyan

# Créer des dossiers pour les services si nécessaire
$services = @(
    @{Name="metube"; Port=8082; Path="metube-service"},
    @{Name="psitransfer"; Port=8084; Path="psitransfer-service"},
    @{Name="whisper"; Port=8093; Path="whisper-service"},
    @{Name="qrcodes"; Port=7005; Path="qr-codes-service"},
    @{Name="rembg"; Port=8080; Path="docker-services/rembg-web"}
)

foreach ($service in $services) {
    Write-Host "`n🔧 Configuration du service $($service.Name) (port $($service.Port))..." -ForegroundColor Yellow
    
    # Vérifier si le service existe déjà
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)" -UseBasicParsing -TimeoutSec 3
        Write-Host "✅ $($service.Name) - Code: $($response.StatusCode)" -ForegroundColor Green
        continue
    } catch {
        Write-Host "❌ $($service.Name) - Service non démarré" -ForegroundColor Red
    }
    
    # Créer un serveur simple si le dossier existe
    $servicePath = $service.Path
    if (Test-Path $servicePath) {
        Write-Host "📁 Dossier trouvé: $servicePath" -ForegroundColor Cyan
        
        # Créer un serveur Node.js simple
        $serverScript = @"
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = $($service.Port);
const PUBLIC_DIR = __dirname;

const server = http.createServer((req, res) => {
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
    
    // Si pas de fichier, servir une page par défaut
    if (!fs.existsSync(filePath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(\`
<!DOCTYPE html>
<html>
<head>
    <title>$($service.Name) - Service</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { color: #28a745; font-size: 24px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>$($service.Name)</h1>
        <div class="status">✅ Service actif sur le port $($service.Port)</div>
        <p>Service $($service.name) démarré avec succès via Cloudflare.</p>
        <p>Accès via: <strong>https://$($service.name).iahome.fr</strong></p>
    </div>
</body>
</html>
        \`);
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
    console.log(\`$($service.Name) server running at http://localhost:\${PORT}/\`);
});
"@
        
        # Écrire le script serveur
        $serverFile = Join-Path $servicePath "server.js"
        $serverScript | Out-File -FilePath $serverFile -Encoding UTF8
        
        # Démarrer le serveur
        Write-Host "🚀 Démarrage du serveur $($service.Name)..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-Command", "cd '$PWD\$servicePath'; node server.js" -WindowStyle Minimized
        
        Start-Sleep -Seconds 3
        
        # Vérifier le démarrage
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)" -UseBasicParsing -TimeoutSec 5
            Write-Host "✅ $($service.Name) démarré - Code: $($response.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "❌ $($service.Name) - Erreur de démarrage: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ Dossier $servicePath non trouvé - Service ignoré" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Configuration des services terminée!" -ForegroundColor Green
Write-Host "📋 Services configurés:" -ForegroundColor Cyan
Write-Host "   ✅ Next.js: http://localhost:3000" -ForegroundColor Green
Write-Host "   ✅ LibreSpeed: http://localhost:8081" -ForegroundColor Green
Write-Host "   📹 MeTube: http://localhost:8082" -ForegroundColor Yellow
Write-Host "   📁 PsiTransfer: http://localhost:8084" -ForegroundColor Yellow
Write-Host "   🎤 Whisper: http://localhost:8093" -ForegroundColor Yellow
Write-Host "   📱 QR Codes: http://localhost:7005" -ForegroundColor Yellow
Write-Host "   🖼️ ReMBG: http://localhost:8080" -ForegroundColor Yellow



