# Script pour réparer la configuration Cloudflare
# Corrige les ports et services

Write-Host "🔧 Réparation de la configuration Cloudflare..." -ForegroundColor Cyan

# Arrêter le tunnel existant
Write-Host "⏹️ Arrêt du tunnel existant..." -ForegroundColor Yellow
try {
    Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 3
    Write-Host "✅ Tunnel arrêté" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Aucun tunnel en cours d'exécution" -ForegroundColor Yellow
}

# Vérifier que le fichier de configuration existe
if (-not (Test-Path "cloudflare-fixed-config.yml")) {
    Write-Host "❌ Fichier cloudflare-fixed-config.yml non trouvé" -ForegroundColor Red
    exit 1
}

# Vérifier que le fichier de credentials existe
$credentialsFile = "C:\Users\AAA\.cloudflared\02a960c5-edd6-4b3f-844f-410b16247262.json"
if (-not (Test-Path $credentialsFile)) {
    Write-Host "❌ Fichier de credentials non trouvé: $credentialsFile" -ForegroundColor Red
    exit 1
}

# Démarrer le tunnel avec la nouvelle configuration
Write-Host "🚀 Démarrage du tunnel avec la configuration corrigée..." -ForegroundColor Cyan
try {
    Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel", "--config", "cloudflare-fixed-config.yml", "run" -WindowStyle Hidden
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

# Tester les sous-domaines
Write-Host "🧪 Test des sous-domaines..." -ForegroundColor Cyan

$subdomains = @(
    "https://iahome.fr",
    "https://librespeed.iahome.fr",
    "https://metube.iahome.fr",
    "https://qrcodes.iahome.fr",
    "https://whisper.iahome.fr",
    "https://psitransfer.iahome.fr",
    "https://pdf.iahome.fr"
)

foreach ($subdomain in $subdomains) {
    try {
        $response = Invoke-WebRequest -Uri $subdomain -Method Head -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $subdomain - OK" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $subdomain - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $subdomain - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "🎉 Réparation terminée !" -ForegroundColor Green
Write-Host "📋 Configuration appliquée: cloudflare-fixed-config.yml" -ForegroundColor Cyan
Write-Host "🔍 Vérifiez les logs du tunnel pour plus de détails" -ForegroundColor Cyan



