Write-Host "🚀 Création des services de maintenance pour Cloudflare..." -ForegroundColor Cyan

# Services à créer
$services = @(
    @{Name="metube"; Port=8082; Domain="metube.iahome.fr"},
    @{Name="psitransfer"; Port=8084; Domain="psitransfer.iahome.fr"},
    @{Name="whisper"; Port=8093; Domain="whisper.iahome.fr"},
    @{Name="qrcodes"; Port=7005; Domain="qrcodes.iahome.fr"},
    @{Name="rembg"; Port=8080; Domain="rembg.iahome.fr"}
)

foreach ($service in $services) {
    Write-Host "`n🔧 Création du service $($service.Name) (port $($service.Port))..." -ForegroundColor Yellow
    
    # Créer le dossier du service
    $serviceDir = "services-$($service.Name)"
    if (!(Test-Path $serviceDir)) {
        New-Item -ItemType Directory -Path $serviceDir -Force | Out-Null
        Write-Host "📁 Dossier créé: $serviceDir" -ForegroundColor Cyan
    }
    
    # Créer le fichier HTML de maintenance
    $htmlContent = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$($service.Name) - En maintenance</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            text-align: center;
            max-width: 600px;
            padding: 40px 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .icon {
            font-size: 80px;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .status {
            font-size: 1.2em;
            margin-bottom: 30px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            border-left: 4px solid #4CAF50;
        }
        .info {
            font-size: 1.1em;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .feature {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .feature-icon {
            font-size: 2em;
            margin-bottom: 10px;
        }
        .back-link {
            display: inline-block;
            margin-top: 30px;
            padding: 15px 30px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            transition: all 0.3s ease;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .back-link:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🚧</div>
        <h1>$($service.Name)</h1>
        <div class="status">
            ✅ Service actif sur le port $($service.Port)
        </div>
        <div class="info">
            <p>Le service <strong>$($service.name)</strong> est actuellement en cours de configuration.</p>
            <p>Il sera bientôt disponible avec toutes ses fonctionnalités.</p>
        </div>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">🌐</div>
                <h3>Accessible via Cloudflare</h3>
                <p>Service sécurisé et optimisé</p>
            </div>
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <h3>Performance optimisée</h3>
                <p>Chargement rapide et fiable</p>
            </div>
            <div class="feature">
                <div class="feature-icon">🔒</div>
                <h3>Sécurisé</h3>
                <p>Protection des données</p>
            </div>
        </div>
        
        <p><strong>Accès via:</strong> <a href="https://$($service.Domain)" style="color: #FFD700;">https://$($service.Domain)</a></p>
        
        <a href="https://iahome.fr" class="back-link">
            🏠 Retour à l'accueil
        </a>
    </div>
</body>
</html>
"@
    
    # Écrire le fichier HTML
    $htmlFile = Join-Path $serviceDir "index.html"
    $htmlContent | Out-File -FilePath $htmlFile -Encoding UTF8
    
    # Créer le serveur Node.js
    $serverScript = @"
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = $($service.Port);
const PUBLIC_DIR = __dirname;

const server = http.createServer((req, res) => {
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
    
    // Toujours servir la page de maintenance
    if (!fs.existsSync(filePath) || path.extname(filePath) === '') {
        filePath = path.join(PUBLIC_DIR, 'index.html');
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
            res.writeHead(500);
            res.end('Erreur serveur: ' + error.code);
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(\`$($service.Name) maintenance server running at http://localhost:\${PORT}/\`);
});
"@
    
    # Écrire le script serveur
    $serverFile = Join-Path $serviceDir "server.js"
    $serverScript | Out-File -FilePath $serverFile -Encoding UTF8
    
    # Démarrer le serveur
    Write-Host "🚀 Démarrage du serveur $($service.Name)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD\$serviceDir'; node server.js" -WindowStyle Minimized
    
    Start-Sleep -Seconds 2
    
    # Vérifier le démarrage
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)" -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ $($service.Name) démarré - Code: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name) - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Services de maintenance créés!" -ForegroundColor Green
Write-Host "📋 Services disponibles:" -ForegroundColor Cyan
Write-Host "   ✅ Next.js: http://localhost:3000" -ForegroundColor Green
Write-Host "   ✅ LibreSpeed: http://localhost:8081" -ForegroundColor Green
Write-Host "   🚧 MeTube: http://localhost:8082 (maintenance)" -ForegroundColor Yellow
Write-Host "   🚧 PsiTransfer: http://localhost:8084 (maintenance)" -ForegroundColor Yellow
Write-Host "   🚧 Whisper: http://localhost:8093 (maintenance)" -ForegroundColor Yellow
Write-Host "   🚧 QR Codes: http://localhost:7005 (maintenance)" -ForegroundColor Yellow
Write-Host "   🚧 ReMBG: http://localhost:8080 (maintenance)" -ForegroundColor Yellow








