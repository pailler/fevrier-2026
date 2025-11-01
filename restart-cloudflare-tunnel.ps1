# Script de redémarrage du tunnel Cloudflare pour iahome
# Redémarre le tunnel iahome-new avec la configuration cloudflare-active-config.yml

Write-Host "🔄 Redémarrage du tunnel Cloudflare...`n" -ForegroundColor Cyan

# 1. Arrêt des processus cloudflared existants
Write-Host "1️⃣ Arrêt des processus cloudflared existants..." -ForegroundColor Yellow
$cloudflaredProcesses = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue

if ($cloudflaredProcesses) {
    foreach ($proc in $cloudflaredProcesses) {
        Write-Host "   ⏹️  Arrêt du processus PID: $($proc.Id)" -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   ✅ Processus arrêtés" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "   ℹ️  Aucun processus cloudflared trouvé" -ForegroundColor Gray
}

# 2. Recherche du fichier de configuration
Write-Host "`n2️⃣ Recherche du fichier de configuration..." -ForegroundColor Yellow
$configPath = Resolve-Path "cloudflare-active-config.yml" -ErrorAction SilentlyContinue

if ($configPath) {
    Write-Host "   ✅ Configuration trouvée: $configPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ Fichier cloudflare-active-config.yml non trouvé" -ForegroundColor Red
    Write-Host "   💡 Création d'un chemin par défaut..." -ForegroundColor Yellow
    $configPath = Join-Path $PWD "cloudflare-active-config.yml"
}

# 3. Démarrage du tunnel
Write-Host "`n3️⃣ Démarrage du tunnel iahome-new..." -ForegroundColor Yellow
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--config", "`"$configPath`"", "run", "iahome-new" -WindowStyle Hidden
Write-Host "   ✅ Tunnel démarré en arrière-plan" -ForegroundColor Green

# 4. Attente de la connexion
Write-Host "`n⏳ Attente de 5 secondes pour la connexion..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 5. Vérification du statut
Write-Host "`n4️⃣ Vérification du statut du tunnel..." -ForegroundColor Yellow
$tunnelInfo = cloudflared tunnel info iahome-new 2>&1

if ($tunnelInfo -match "CONNECTOR ID") {
    Write-Host "   ✅ Tunnel actif et connecté!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Tunnel en cours de connexion ou problème détecté" -ForegroundColor Yellow
    Write-Host "   📋 Statut:" -ForegroundColor Cyan
    Write-Host $tunnelInfo -ForegroundColor Gray
}

Write-Host "`n✅ Redémarrage terminé!" -ForegroundColor Green
Write-Host "🌐 Le Worker Cloudflare est maintenant actif pour librespeed.iahome.fr" -ForegroundColor Cyan


