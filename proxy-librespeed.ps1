# Script pour créer un proxy local pour LibreSpeed sécurisé
Write-Host "🔧 Création d'un proxy local pour LibreSpeed" -ForegroundColor Green

# Arrêter le conteneur Cloudflared problématique
Write-Host "`n🛑 Arrêt de Cloudflared..." -ForegroundColor Yellow
docker stop cloudflared-tunnel 2>$null
docker rm cloudflared-tunnel 2>$null

# Créer un proxy simple avec nginx
Write-Host "`n📝 Création du fichier de configuration nginx..." -ForegroundColor Yellow

$nginxConfig = @"
events {
    worker_connections 1024;
}

http {
    upstream iahome_app {
        server iahome-app:3000;
    }
    
    upstream librespeed {
        server librespeed:80;
    }
    
    server {
        listen 8080;
        server_name librespeed.iahome.fr;
        
        # Proxy vers l'API de vérification
        location / {
            proxy_pass http://iahome_app/api/check-auth;
            proxy_set_header Host librespeed.iahome.fr;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;
        }
    }
    
    server {
        listen 8081;
        server_name librespeed.iahome.fr;
        
        # Proxy direct vers LibreSpeed (après vérification)
        location / {
            proxy_pass http://librespeed/;
            proxy_set_header Host `$host;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto `$scheme;
        }
    }
}
"@

$nginxConfig | Out-File -FilePath "nginx-librespeed.conf" -Encoding UTF8

Write-Host "`n🐳 Création du conteneur nginx proxy..." -ForegroundColor Yellow
docker run -d --name nginx-librespeed-proxy --restart unless-stopped -p 8080:8080 -p 8081:8081 -v "${PWD}\nginx-librespeed.conf:/etc/nginx/nginx.conf" --network iahome_default nginx:alpine

Write-Host "`n✅ Proxy local créé !" -ForegroundColor Green
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "- Port 8080: Vérification des tokens (librespeed.iahome.fr:8080)" -ForegroundColor White
Write-Host "- Port 8081: LibreSpeed direct (librespeed.iahome.fr:8081)" -ForegroundColor White

Write-Host "`n🧪 Test du proxy..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test du proxy
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080?token=test" -Headers @{"Host" = "librespeed.iahome.fr"} -ErrorAction Stop
    Write-Host "✅ Proxy fonctionne (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur proxy: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Modifiez cloudflared-config-final.yml pour pointer vers localhost:8080" -ForegroundColor White
Write-Host "2. Redémarrez Cloudflared" -ForegroundColor White
Write-Host "3. Testez l'accès à LibreSpeed" -ForegroundColor White
