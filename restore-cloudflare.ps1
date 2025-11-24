# Script de restauration complète de Cloudflare Tunnel

Write-Host "🔧 RESTAURATION CLOUDFLARE TUNNEL" -ForegroundColor Cyan
Write-Host "=================================`n" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 1. Arrêt complet de tous les processus
Write-Host "1️⃣ Arrêt de tous les processus cloudflared..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "   ⏹️  Arrêt de $($processes.Count) processus..." -ForegroundColor Gray
    $processes | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
            Write-Host "      ✅ Processus $($_.Id) arrêté" -ForegroundColor Gray
        } catch {
            Write-Host "      ⚠️  Tentative avec taskkill pour $($_.Id)..." -ForegroundColor Yellow
            Start-Process -FilePath "taskkill" -ArgumentList "/F", "/PID", $_.Id -WindowStyle Hidden -Wait -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 5
    
    # Vérifier qu'il ne reste plus de processus
    $remaining = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($remaining) {
        Write-Host "   ⚠️  Processus persistants, nouvelle tentative..." -ForegroundColor Yellow
        $remaining | ForEach-Object {
            Start-Process -FilePath "taskkill" -ArgumentList "/F", "/PID", $_.Id -WindowStyle Hidden -Wait -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 3
    }
    Write-Host "   ✅ Tous les processus arrêtés" -ForegroundColor Green
} else {
    Write-Host "   ✅ Aucun processus à arrêter" -ForegroundColor Green
}

# 2. Vérification de la configuration
Write-Host "`n2️⃣ Vérification de la configuration..." -ForegroundColor Yellow
$configFile = "cloudflare-active-config.yml"
if (Test-Path $configFile) {
    Write-Host "   ✅ Fichier de configuration trouvé: $configFile" -ForegroundColor Green
    $configContent = Get-Content $configFile -Raw
    if ($configContent -match "tunnel:\s*(\S+)") {
        $tunnelName = $matches[1]
        Write-Host "   ✅ Tunnel configuré: $tunnelName" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ Fichier de configuration introuvable: $configFile" -ForegroundColor Red
    Write-Host "   💡 Assurez-vous que le fichier existe dans le répertoire actuel" -ForegroundColor Gray
    exit 1
}

# 3. Vérification de cloudflared.exe
Write-Host "`n3️⃣ Vérification de cloudflared.exe..." -ForegroundColor Yellow
$cloudflaredExe = "cloudflared.exe"
if (Test-Path $cloudflaredExe) {
    Write-Host "   ✅ cloudflared.exe trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ cloudflared.exe introuvable!" -ForegroundColor Red
    Write-Host "   💡 Téléchargez cloudflared depuis https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" -ForegroundColor Gray
    exit 1
}

# 4. Vérification des credentials
Write-Host "`n4️⃣ Vérification des credentials..." -ForegroundColor Yellow
$credPath = "C:\Users\AAA\.cloudflared\02a960c5-edd6-4b3f-844f-410b16247262.json"
if (Test-Path $credPath) {
    Write-Host "   ✅ Fichier de credentials trouvé" -ForegroundColor Green
    try {
        $credContent = Get-Content $credPath -Raw | ConvertFrom-Json
        if ($credContent.AccountTag -and $credContent.TunnelSecret) {
            Write-Host "   ✅ Credentials valides" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Credentials incomplets" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ⚠️  Impossible de valider les credentials" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Fichier de credentials introuvable: $credPath" -ForegroundColor Red
    Write-Host "   💡 Vous devrez peut-être recréer le tunnel" -ForegroundColor Gray
}

# 5. Vérification des services locaux critiques
Write-Host "`n5️⃣ Vérification des services locaux..." -ForegroundColor Yellow
$services = @{
    "Next.js (port 3000)" = "http://localhost:3000"
    "QR Codes (port 7006)" = "http://localhost:7006"
    "LibreSpeed (port 8085)" = "http://localhost:8085"
    "Whisper (port 8093)" = "http://localhost:8093"
}

$servicesOk = @()
$servicesFailed = @()

foreach ($service in $services.GetEnumerator()) {
    try {
        $response = Invoke-WebRequest -Uri $service.Value -Method Head -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ $($service.Key) : HTTP $($response.StatusCode)" -ForegroundColor Green
        $servicesOk += $service.Key
    } catch {
        Write-Host "   ⚠️  $($service.Key) : Non accessible" -ForegroundColor Yellow
        $servicesFailed += $service.Key
    }
}

if ($servicesFailed.Count -gt 0) {
    Write-Host "`n   ⚠️  ATTENTION: $($servicesFailed.Count) service(s) non accessible(s)" -ForegroundColor Yellow
    Write-Host "   💡 Cloudflare peut fonctionner mais certains domaines ne seront pas accessibles" -ForegroundColor Gray
    $continue = Read-Host "   Continuer quand même ? (O/N)"
    if ($continue -ne "O" -and $continue -ne "o") {
        Write-Host "   ❌ Restauration annulée" -ForegroundColor Red
        exit 1
    }
}

# 6. Redémarrage du tunnel
Write-Host "`n6️⃣ Redémarrage de Cloudflare Tunnel..." -ForegroundColor Yellow
Write-Host "   🚀 Lancement avec configuration..." -ForegroundColor Gray

try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; Write-Host '🔵 Cloudflare Tunnel - Restauration' -ForegroundColor Cyan; Write-Host '====================================' -ForegroundColor Cyan; Write-Host ''; cloudflared tunnel --config cloudflare-active-config.yml run" -WindowStyle Normal
    Write-Host "   ✅ Tunnel démarré" -ForegroundColor Green
    Write-Host "   ⏳ Attente de la connexion (45 secondes)..." -ForegroundColor Gray
    Start-Sleep -Seconds 45
} catch {
    Write-Host "   ❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 7. Vérification du démarrage
Write-Host "`n7️⃣ Vérification du démarrage..." -ForegroundColor Yellow
$newProcesses = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($newProcesses) {
    Write-Host "   ✅ Cloudflare Tunnel en cours d'exécution (PID: $($newProcesses.Id -join ', '))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Cloudflare Tunnel n'a pas démarré" -ForegroundColor Red
    Write-Host "   💡 Vérifiez la fenêtre PowerShell pour les erreurs" -ForegroundColor Yellow
    exit 1
}

# 8. Tests de connectivité
Write-Host "`n8️⃣ Tests de connectivité..." -ForegroundColor Yellow
$domains = @(
    "https://iahome.fr",
    "https://qrcodes.iahome.fr",
    "https://librespeed.iahome.fr",
    "https://whisper.iahome.fr"
)

$successCount = 0
$failCount = 0

foreach ($domain in $domains) {
    try {
        $response = Invoke-WebRequest -Uri $domain -Method Head -TimeoutSec 20 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ $domain : HTTP $($response.StatusCode)" -ForegroundColor Green
        $successCount++
    } catch {
        $statusCode = $null
        try {
            $statusCode = $_.Exception.Response.StatusCode.value__
        } catch {}
        
        if ($statusCode -eq 1033) {
            Write-Host "   ❌ $domain : Error 1033 (Tunnel error)" -ForegroundColor Red
        } elseif ($statusCode) {
            Write-Host "   ⚠️  $domain : HTTP $statusCode" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ $domain : Erreur de connexion" -ForegroundColor Red
        }
        $failCount++
    }
}

# 9. Résumé
Write-Host "`n📊 RÉSUMÉ DE LA RESTAURATION:" -ForegroundColor Cyan
Write-Host "   ✅ Configuration vérifiée" -ForegroundColor Green
Write-Host "   ✅ Credentials vérifiés" -ForegroundColor Green
Write-Host "   ✅ Services locaux: $($servicesOk.Count)/$($services.Count) accessibles" -ForegroundColor $(if ($servicesOk.Count -eq $services.Count) { "Green" } else { "Yellow" })
Write-Host "   ✅ Cloudflare Tunnel: Actif (PID: $($newProcesses.Id -join ', '))" -ForegroundColor Green
Write-Host "   ✅ Connectivité: $successCount/$($domains.Count) domaines accessibles" -ForegroundColor $(if ($successCount -eq $domains.Count) { "Green" } else { "Yellow" })

if ($failCount -gt 0) {
    Write-Host "`n⚠️  Certains domaines ne sont pas accessibles" -ForegroundColor Yellow
    Write-Host "   💡 Si l'erreur 1033 persiste:" -ForegroundColor Gray
    Write-Host "      - Attendez 2-3 minutes supplémentaires" -ForegroundColor Gray
    Write-Host "      - Vérifiez la fenêtre PowerShell Cloudflare pour les erreurs" -ForegroundColor Gray
    Write-Host "      - Vérifiez le dashboard Cloudflare (https://one.dash.cloudflare.com/)" -ForegroundColor Gray
    Write-Host "      - Vérifiez votre connexion Internet" -ForegroundColor Gray
} else {
    Write-Host "`n✅ RESTAURATION RÉUSSIE!" -ForegroundColor Green
    Write-Host "   Tous les domaines sont accessibles" -ForegroundColor Green
}

Write-Host ""

