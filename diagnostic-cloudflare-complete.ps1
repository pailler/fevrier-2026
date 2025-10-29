# Script de diagnostic et correction complète de Cloudflare
# Identifie et corrige les problèmes de configuration et de connexion

Write-Host "🔍 Diagnostic complet de Cloudflare..." -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier les processus cloudflared
Write-Host "1️⃣ Vérification des processus cloudflared..." -ForegroundColor Yellow
$cloudflaredProcesses = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcesses) {
    Write-Host "   ✅ $($cloudflaredProcesses.Count) processus cloudflared détectés" -ForegroundColor Green
    $cloudflaredProcesses | ForEach-Object { Write-Host "      PID: $($_.Id) - Démarrage: $($_.StartTime)" -ForegroundColor Gray }
} else {
    Write-Host "   ❌ Aucun processus cloudflared actif" -ForegroundColor Red
}

# 2. Vérifier le statut du tunnel
Write-Host "`n2️⃣ Vérification du statut du tunnel..." -ForegroundColor Yellow
try {
    $tunnelInfo = & .\cloudflared.exe tunnel info iahome-new 2>&1
    if ($tunnelInfo -match "CONNECTOR ID") {
        Write-Host "   ✅ Tunnel actif avec connexions" -ForegroundColor Green
        $tunnelInfo | Select-String "CONNECTOR ID" | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
    } else {
        Write-Host "   ❌ Tunnel non actif" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Impossible de vérifier le tunnel" -ForegroundColor Red
}

# 3. Vérifier les ports des services
Write-Host "`n3️⃣ Vérification des ports des services..." -ForegroundColor Yellow
$services = @(
    @{Name="iahome.fr"; Port=3000; URL="http://localhost:3000"},
    @{Name="qrcodes.iahome.fr"; Port=7006; URL="http://localhost:7006"},
    @{Name="librespeed.iahome.fr"; Port=8085; URL="http://localhost:8085"},
    @{Name="whisper.iahome.fr"; Port=8093; URL="http://localhost:8093"},
    @{Name="psitransfer.iahome.fr"; Port=8087; URL="http://localhost:8087"},
    @{Name="metube.iahome.fr"; Port=8081; URL="http://localhost:8081"},
    @{Name="pdf.iahome.fr"; Port=8086; URL="http://localhost:8086"},
    @{Name="meeting-reports.iahome.fr"; Port=3050; URL="http://localhost:3050"}
)

$servicesStatus = @()
foreach ($service in $services) {
    $listening = netstat -ano | findstr ":$($service.Port) " | findstr "LISTENING" | Out-String
    if ($listening.Trim()) {
        Write-Host "   ✅ Port $($service.Port) ($($service.Name)) : Écoute" -ForegroundColor Green
        $servicesStatus += @{Service=$service.Name; Port=$service.Port; Status="OK"}
    } else {
        Write-Host "   ❌ Port $($service.Port) ($($service.Name)) : Non accessible" -ForegroundColor Red
        $servicesStatus += @{Service=$service.Name; Port=$service.Port; Status="OFFLINE"}
    }
}

# 4. Tester l'accessibilité des services locaux
Write-Host "`n4️⃣ Test d'accessibilité des services locaux..." -ForegroundColor Yellow
foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -Method Head -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ $($service.Name) : Accessible (Code: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ $($service.Name) : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 5. Tester l'accessibilité via Cloudflare
Write-Host "`n5️⃣ Test d'accessibilité via Cloudflare (HTTPS)..." -ForegroundColor Yellow
$testDomains = @(
    "https://iahome.fr",
    "https://qrcodes.iahome.fr",
    "https://librespeed.iahome.fr",
    "https://whisper.iahome.fr",
    "https://meeting-reports.iahome.fr"
)

foreach ($domain in $testDomains) {
    try {
        $response = Invoke-WebRequest -Uri $domain -Method Head -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ $domain : $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = "N/A"
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode.value__
        }
        Write-Host "   ❌ $domain : Erreur $statusCode - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. Résumé des problèmes
Write-Host "`n📊 RÉSUMÉ DES PROBLÈMES:" -ForegroundColor Cyan
$offlineServices = $servicesStatus | Where-Object { $_.Status -eq "OFFLINE" }
if ($offlineServices) {
    Write-Host "   ⚠️ Services non démarrés:" -ForegroundColor Yellow
    $offlineServices | ForEach-Object { Write-Host "      - $($_.Service) (port $($_.Port))" -ForegroundColor Red }
} else {
    Write-Host "   ✅ Tous les services sont démarrés" -ForegroundColor Green
}

# 7. Recommandations
Write-Host "`n💡 RECOMMANDATIONS:" -ForegroundColor Cyan
if (-not $cloudflaredProcesses) {
    Write-Host "   1. Redémarrer le tunnel Cloudflare:" -ForegroundColor Yellow
    Write-Host "      .\restore-cloudflare.ps1" -ForegroundColor Gray
}

if ($offlineServices) {
    Write-Host "   2. Démarrer les services manquants:" -ForegroundColor Yellow
    $offlineServices | ForEach-Object {
        switch ($_.Port) {
            7006 { Write-Host "      - QR Codes: docker-services\essentiels\start-qrcodes.ps1" -ForegroundColor Gray }
            8093 { Write-Host "      - Whisper: whisper-service\start-whisper.ps1" -ForegroundColor Gray }
            8085 { Write-Host "      - LibreSpeed: docker-services\essentiels\start-librespeed.ps1" -ForegroundColor Gray }
            3050 { Write-Host "      - Meeting Reports: Voir meeting-reports\ETAT_FINAL_CLOUDFLARE.md" -ForegroundColor Gray }
        }
    }
}

Write-Host "`n✅ Diagnostic terminé!" -ForegroundColor Green


