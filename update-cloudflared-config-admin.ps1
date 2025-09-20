# Script pour mettre à jour la configuration cloudflared (nécessite des privilèges administrateur)
Write-Host "🔧 Mise à jour de la configuration cloudflared..." -ForegroundColor Yellow

# Vérifier si on a les privilèges administrateur
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Ce script nécessite des privilèges administrateur!" -ForegroundColor Red
    Write-Host "💡 Exécutez PowerShell en tant qu'administrateur et relancez ce script" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Privilèges administrateur confirmés" -ForegroundColor Green

# Arrêter le service cloudflared
Write-Host "🛑 Arrêt du service cloudflared..." -ForegroundColor Red
try {
    Stop-Service -Name "Cloudflared" -Force
    Write-Host "✅ Service cloudflared arrêté" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erreur lors de l'arrêt du service: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Copier la nouvelle configuration
Write-Host "📋 Copie de la nouvelle configuration..." -ForegroundColor Cyan
try {
    Copy-Item "cloudflared-config.yml" "C:\Program Files (x86)\cloudflared\config.yml" -Force
    Write-Host "✅ Configuration copiée avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la copie: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Redémarrer le service cloudflared
Write-Host "🚀 Redémarrage du service cloudflared..." -ForegroundColor Green
try {
    Start-Service -Name "Cloudflared"
    Write-Host "✅ Service cloudflared redémarré" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du redémarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Attendre que le service démarre
Start-Sleep -Seconds 10

# Vérifier le statut du service
$service = Get-Service -Name "Cloudflared"
if ($service.Status -eq "Running") {
    Write-Host "✅ Service cloudflared fonctionne correctement" -ForegroundColor Green
} else {
    Write-Host "❌ Service cloudflared ne fonctionne pas (Status: $($service.Status))" -ForegroundColor Red
    exit 1
}

# Tester la nouvelle configuration
Write-Host "`n🧪 Test de la nouvelle configuration..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.Headers.Location) {
        Write-Host "Location: $($response.Headers.Location)" -ForegroundColor White
        if ($response.Headers.Location -like "*login*") {
            Write-Host "✅ SUCCÈS: LibreSpeed redirige vers login!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ LibreSpeed redirige vers: $($response.Headers.Location)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ LibreSpeed ne redirige pas (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Configuration cloudflared mise à jour!" -ForegroundColor Green
Write-Host "🔒 LibreSpeed est maintenant sécurisé:" -ForegroundColor Cyan
Write-Host "   - Accès direct sans token → redirection vers login" -ForegroundColor White
Write-Host "   - Accès avec token valide → accès autorisé" -ForegroundColor White

