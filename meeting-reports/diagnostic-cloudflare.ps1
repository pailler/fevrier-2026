# Script de diagnostic complet pour Cloudflare
Write-Host "🔍 Diagnostic Cloudflare Meeting Reports..." -ForegroundColor Green

# 1. Vérification des processus
Write-Host "`n📊 État des processus:" -ForegroundColor Cyan
$processes = Get-Process | Where-Object { $_.ProcessName -like "*node*" -or $_.ProcessName -like "*python*" -or $_.ProcessName -like "*traefik*" }
if ($processes) {
    $processes | ForEach-Object {
        Write-Host "  ✅ $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ Aucun processus trouvé" -ForegroundColor Red
}

# 2. Test des ports locaux
Write-Host "`n🌐 Test des ports locaux:" -ForegroundColor Cyan

# Test Frontend
try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✅ Frontend (port 3001): $($frontendTest.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Frontend (port 3001): $($_.Exception.Message)" -ForegroundColor Red
}

# Test Backend
try {
    $backendTest = Invoke-WebRequest -Uri "http://localhost:8001/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✅ Backend (port 8001): $($backendTest.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Backend (port 8001): $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test du domaine Cloudflare
Write-Host "`n☁️ Test du domaine Cloudflare:" -ForegroundColor Cyan

# Test principal
try {
    $domainTest = Invoke-WebRequest -Uri "https://meeting-reports.iahome.fr" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "  ✅ Domaine principal: $($domainTest.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Domaine principal: $($_.Exception.Message)" -ForegroundColor Red
}

# Test API
try {
    $apiTest = Invoke-WebRequest -Uri "https://meeting-reports.iahome.fr/api/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "  ✅ API via domaine: $($apiTest.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ API via domaine: $($_.Exception.Message)" -ForegroundColor Red
}

# Test documentation
try {
    $docsTest = Invoke-WebRequest -Uri "https://meeting-reports.iahome.fr/api/docs" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "  ✅ Documentation API: $($docsTest.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Documentation API: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Vérification des configurations Traefik
Write-Host "`n⚙️ Vérification des configurations Traefik:" -ForegroundColor Cyan

$traefikConfigPath = "C:\Users\AAA\Documents\iahome\traefik\dynamic\"
if (Test-Path "$traefikConfigPath\traefik-meeting-reports.yml") {
    Write-Host "  ✅ Configuration frontend trouvée" -ForegroundColor Green
} else {
    Write-Host "  ❌ Configuration frontend manquante" -ForegroundColor Red
}

if (Test-Path "$traefikConfigPath\traefik-meeting-reports-api.yml") {
    Write-Host "  ✅ Configuration API trouvée" -ForegroundColor Green
} else {
    Write-Host "  ❌ Configuration API manquante" -ForegroundColor Red
}

# 5. Test de résolution DNS
Write-Host "`n🌍 Test de résolution DNS:" -ForegroundColor Cyan
try {
    $dnsTest = Resolve-DnsName "meeting-reports.iahome.fr" -ErrorAction Stop
    Write-Host "  ✅ Résolution DNS: $($dnsTest[0].IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Résolution DNS: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Vérification des certificats SSL
Write-Host "`n🔒 Vérification SSL:" -ForegroundColor Cyan
try {
    $sslTest = Invoke-WebRequest -Uri "https://meeting-reports.iahome.fr" -TimeoutSec 10 -ErrorAction Stop
    if ($sslTest.Headers.ContainsKey("Strict-Transport-Security")) {
        Write-Host "  ✅ HTTPS configuré" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ HTTPS partiellement configuré" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Problème SSL: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Résumé du diagnostic:" -ForegroundColor Green
Write-Host "  - Vérifiez que tous les services sont en cours d'exécution" -ForegroundColor White
Write-Host "  - Vérifiez que Traefik est configuré et redémarré" -ForegroundColor White
Write-Host "  - Vérifiez que Cloudflare Tunnel est actif" -ForegroundColor White
Write-Host "  - Vérifiez que le domaine pointe vers votre tunnel" -ForegroundColor White
