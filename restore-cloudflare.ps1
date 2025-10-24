# Script pour rétablir Cloudflare complètement
# Arrête, corrige et redémarre le tunnel

Write-Host "🔧 Rétablissement complet de Cloudflare..." -ForegroundColor Cyan

# 1. Arrêter tous les processus cloudflared
Write-Host "⏹️ Arrêt de tous les processus cloudflared..." -ForegroundColor Yellow
try {
    Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 3
    Write-Host "✅ Tous les processus cloudflared arrêtés" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Aucun processus cloudflared en cours" -ForegroundColor Yellow
}

# 2. Vérifier que l'application Next.js est en cours d'exécution
Write-Host "🔍 Vérification de l'application Next.js..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application Next.js accessible sur localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Application Next.js répond avec le code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Application Next.js non accessible sur localhost:3000" -ForegroundColor Red
    Write-Host "💡 Veuillez démarrer l'application Next.js avec: npm run dev" -ForegroundColor Yellow
    exit 1
}

# 3. Créer une configuration Cloudflare corrigée
Write-Host "📝 Création de la configuration Cloudflare corrigée..." -ForegroundColor Cyan

$configContent = @"
tunnel: iahome-new
credentials-file: C:\Users\AAA\.cloudflared\02a960c5-edd6-4b3f-844f-410b16247262.json

ingress:
  # Application principale Next.js
  - hostname: iahome.fr
    service: http://127.0.0.1:3000
    originRequest:
      httpHostHeader: iahome.fr
      noTLSVerify: true
      
  - hostname: www.iahome.fr
    service: http://127.0.0.1:3000
    originRequest:
      httpHostHeader: www.iahome.fr
      noTLSVerify: true

  # Services essentiels - tous pointent vers Next.js pour l'instant
  - hostname: librespeed.iahome.fr
    service: http://127.0.0.1:3000
    originRequest:
      httpHostHeader: librespeed.iahome.fr
      noTLSVerify: true
      
  - hostname: metube.iahome.fr
    service: http://127.0.0.1:3000
    originRequest:
      httpHostHeader: metube.iahome.fr
      noTLSVerify: true
      
  - hostname: whisper.iahome.fr
    service: http://127.0.0.1:3000
    originRequest:
      httpHostHeader: whisper.iahome.fr
      noTLSVerify: true
      
  - hostname: psitransfer.iahome.fr
    service: http://127.0.0.1:3000
    originRequest:
      httpHostHeader: psitransfer.iahome.fr
      noTLSVerify: true
      
  - hostname: qrcodes.iahome.fr
    service: http://127.0.0.1:3000
    originRequest:
      httpHostHeader: qrcodes.iahome.fr
      noTLSVerify: true
      
  - hostname: pdf.iahome.fr
    service: http://127.0.0.1:3000
    originRequest:
      httpHostHeader: pdf.iahome.fr
      noTLSVerify: true

  # Services IA - tous pointent vers Next.js pour l'instant
  - hostname: stablediffusion.iahome.fr
    service: http://127.0.0.1:3000
    originRequest:
      httpHostHeader: stablediffusion.iahome.fr
      noTLSVerify: true
      
  - hostname: comfyui.iahome.fr
    service: http://127.0.0.1:3000
    originRequest:
      httpHostHeader: comfyui.iahome.fr
      noTLSVerify: true
      
  - hostname: ruinedfooocus.iahome.fr
    service: http://127.0.0.1:3000
    originRequest:
      httpHostHeader: ruinedfooocus.iahome.fr
      noTLSVerify: true
      
  - hostname: cogstudio.iahome.fr
    service: http://127.0.0.1:3000
    originRequest:
      httpHostHeader: cogstudio.iahome.fr
      noTLSVerify: true

  # Services spéciaux
  - hostname: meeting-reports.iahome.fr
    service: http://127.0.0.1:3000
    originRequest:
      httpHostHeader: meeting-reports.iahome.fr
      noTLSVerify: true

  # Catch-all pour les requêtes non reconnues
  - service: http_status:404
"@

# Sauvegarder la configuration
$configContent | Out-File -FilePath "cloudflare-restored-config.yml" -Encoding UTF8
Write-Host "✅ Configuration sauvegardée dans cloudflare-restored-config.yml" -ForegroundColor Green

# 4. Vérifier que le fichier de credentials existe
$credentialsFile = "C:\Users\AAA\.cloudflared\02a960c5-edd6-4b3f-844f-410b16247262.json"
if (-not (Test-Path $credentialsFile)) {
    Write-Host "❌ Fichier de credentials non trouvé: $credentialsFile" -ForegroundColor Red
    Write-Host "💡 Veuillez vérifier que le tunnel est correctement configuré" -ForegroundColor Yellow
    exit 1
}

# 5. Démarrer le tunnel avec la nouvelle configuration
Write-Host "🚀 Démarrage du tunnel avec la configuration restaurée..." -ForegroundColor Cyan
try {
    Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel", "--config", "cloudflare-restored-config.yml", "run" -WindowStyle Hidden
    Start-Sleep -Seconds 5
    
    # Vérifier que le tunnel est démarré
    $process = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "✅ Tunnel démarré avec succès (PID: $($process.Id))" -ForegroundColor Green
    } else {
        Write-Host "❌ Échec du démarrage du tunnel" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors du démarrage du tunnel: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. Attendre que le tunnel soit prêt
Write-Host "⏳ Attente que le tunnel soit prêt..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# 7. Tester les domaines
Write-Host "🧪 Test des domaines..." -ForegroundColor Cyan

$domains = @(
    "https://iahome.fr",
    "https://www.iahome.fr"
)

foreach ($domain in $domains) {
    try {
        $response = Invoke-WebRequest -Uri $domain -Method Head -TimeoutSec 15 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $domain - OK" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $domain - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $domain - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "🎉 Rétablissement de Cloudflare terminé !" -ForegroundColor Green
Write-Host "📋 Configuration utilisée: cloudflare-restored-config.yml" -ForegroundColor Cyan
Write-Host "🔍 Vérifiez les logs du tunnel pour plus de détails" -ForegroundColor Cyan
Write-Host "💡 Tous les sous-domaines pointent temporairement vers Next.js" -ForegroundColor Yellow











