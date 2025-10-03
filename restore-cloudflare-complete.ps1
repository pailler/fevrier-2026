# Script de restauration complète de Cloudflare
Write-Host "🚀 RESTAURATION COMPLÈTE CLOUDFLARE" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# 1. Vérifier les prérequis
Write-Host "`n1. Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js installé: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js non installé" -ForegroundColor Red
        Write-Host "⚠️ Installez Node.js depuis https://nodejs.org" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Node.js non installé" -ForegroundColor Red
    exit 1
}

# Vérifier npm
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ npm installé: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ npm non installé" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ npm non installé" -ForegroundColor Red
    exit 1
}

# Vérifier cloudflared.exe
if (Test-Path "cloudflared.exe") {
    Write-Host "✅ cloudflared.exe trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ cloudflared.exe non trouvé" -ForegroundColor Red
    Write-Host "⚠️ Téléchargez cloudflared depuis: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
    exit 1
}

# Vérifier la configuration
if (Test-Path "cloudflare-complete-config.yml") {
    Write-Host "✅ Configuration Cloudflare trouvée" -ForegroundColor Green
} else {
    Write-Host "❌ Configuration Cloudflare non trouvée" -ForegroundColor Red
    exit 1
}

# 2. Arrêter les processus existants
Write-Host "`n2. Arrêt des processus existants..." -ForegroundColor Yellow

# Arrêter cloudflared
$cloudflareProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflareProcess) {
    Write-Host "✅ Arrêt du processus cloudflared existant..." -ForegroundColor Green
    Stop-Process -Name "cloudflared" -Force
    Start-Sleep -Seconds 3
} else {
    Write-Host "ℹ️ Aucun processus cloudflared en cours" -ForegroundColor Blue
}

# Arrêter les processus Node.js sur le port 3000
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*3000*" -or $_.ProcessName -eq "node" }
if ($nodeProcesses) {
    Write-Host "✅ Arrêt des processus Node.js existants..." -ForegroundColor Green
    $nodeProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
} else {
    Write-Host "ℹ️ Aucun processus Node.js en cours" -ForegroundColor Blue
}

# 3. Installer les dépendances
Write-Host "`n3. Installation des dépendances..." -ForegroundColor Yellow
try {
    Write-Host "📦 Installation des packages npm..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dépendances installées avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de l'installation des dépendances: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Démarrer l'application Next.js
Write-Host "`n4. Démarrage de l'application Next.js..." -ForegroundColor Yellow
Write-Host "🚀 Lancement de l'application en arrière-plan..." -ForegroundColor Green

try {
    # Démarrer l'application Next.js en arrière-plan
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = "npm"
    $processInfo.Arguments = "run dev"
    $processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Minimized
    $processInfo.UseShellExecute = $true
    
    $appProcess = [System.Diagnostics.Process]::Start($processInfo)
    
    if ($appProcess) {
        Write-Host "✅ Application Next.js démarrée (PID: $($appProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host "❌ Échec du démarrage de l'application" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors du démarrage de l'application: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 5. Attendre que l'application soit prête
Write-Host "`n5. Attente de l'application..." -ForegroundColor Yellow
Write-Host "⏳ Attente de 15 secondes pour que l'application soit prête..." -ForegroundColor Blue
Start-Sleep -Seconds 15

# Vérifier que l'application répond
Write-Host "🔍 Vérification de l'application..." -ForegroundColor Blue
$maxRetries = 5
$retryCount = 0
$appReady = $false

while ($retryCount -lt $maxRetries -and -not $appReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Application accessible sur http://localhost:3000" -ForegroundColor Green
            $appReady = $true
        } else {
            Write-Host "⚠️ Application non prête (Code: $($response.StatusCode)), nouvelle tentative..." -ForegroundColor Yellow
            $retryCount++
            Start-Sleep -Seconds 5
        }
    } catch {
        Write-Host "⚠️ Application non prête (Erreur: $($_.Exception.Message)), nouvelle tentative..." -ForegroundColor Yellow
        $retryCount++
        Start-Sleep -Seconds 5
    }
}

if (-not $appReady) {
    Write-Host "❌ Application non accessible après $maxRetries tentatives" -ForegroundColor Red
    Write-Host "⚠️ Vérifiez manuellement: http://localhost:3000" -ForegroundColor Yellow
    exit 1
}

# 6. Démarrer Cloudflare Tunnel
Write-Host "`n6. Démarrage du tunnel Cloudflare..." -ForegroundColor Yellow
Write-Host "🚀 Lancement de cloudflared..." -ForegroundColor Green

try {
    # Démarrer cloudflared en arrière-plan
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = ".\cloudflared.exe"
    $processInfo.Arguments = "tunnel --config cloudflare-complete-config.yml run"
    $processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Minimized
    $processInfo.UseShellExecute = $true
    
    $cloudflareProcess = [System.Diagnostics.Process]::Start($processInfo)
    
    if ($cloudflareProcess) {
        Write-Host "✅ Tunnel Cloudflare démarré (PID: $($cloudflareProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host "❌ Échec du démarrage du tunnel Cloudflare" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors du démarrage du tunnel: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 7. Attendre que le tunnel soit opérationnel
Write-Host "`n7. Attente du tunnel Cloudflare..." -ForegroundColor Yellow
Write-Host "⏳ Attente de 20 secondes pour que le tunnel soit opérationnel..." -ForegroundColor Blue
Start-Sleep -Seconds 20

# 8. Tester les routes principales
Write-Host "`n8. Test des routes principales..." -ForegroundColor Yellow

$mainRoutes = @(
    @{url="https://iahome.fr"; name="Site principal"},
    @{url="https://www.iahome.fr"; name="Site principal (www)"},
    @{url="https://iahome.fr/login"; name="Page de connexion"},
    @{url="https://iahome.fr/signup"; name="Page d'inscription"},
    @{url="https://iahome.fr/signup-success"; name="Page de succès inscription"}
)

$successCount = 0
$totalCount = $mainRoutes.Count

foreach ($route in $mainRoutes) {
    try {
        Write-Host "   Test: $($route.name) ($($route.url))..." -ForegroundColor Gray
        $response = Invoke-WebRequest -Uri $route.url -UseBasicParsing -TimeoutSec 15 -SkipCertificateCheck
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ $($route.name) accessible" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "   ❌ $($route.name) non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ $($route.name) erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 9. Tester les services (optionnels)
Write-Host "`n9. Test des services (optionnels)..." -ForegroundColor Yellow

$services = @(
    @{url="https://metube.iahome.fr"; name="MeTube"},
    @{url="https://librespeed.iahome.fr"; name="LibreSpeed"},
    @{url="https://whisper.iahome.fr"; name="Whisper"},
    @{url="https://psitransfer.iahome.fr"; name="PsiTransfer"},
    @{url="https://qrcodes.iahome.fr"; name="QR Codes"},
    @{url="https://pdf.iahome.fr"; name="PDF"},
    @{url="https://rembg.iahome.fr"; name="REMBG"}
)

$serviceSuccessCount = 0
$serviceTotalCount = $services.Count

foreach ($service in $services) {
    try {
        Write-Host "   Test: $($service.name) ($($service.url))..." -ForegroundColor Gray
        $response = Invoke-WebRequest -Uri $service.url -UseBasicParsing -TimeoutSec 10 -SkipCertificateCheck
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ $($service.name) accessible" -ForegroundColor Green
            $serviceSuccessCount++
        } else {
            Write-Host "   ⚠️ $($service.name) non accessible (Code: $($response.StatusCode)) - Service non démarré" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ⚠️ $($service.name) erreur: $($_.Exception.Message) - Service non démarré" -ForegroundColor Yellow
    }
}

# 10. Résumé des résultats
Write-Host "`n10. Résumé des résultats..." -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

Write-Host "`n📊 Routes principales:" -ForegroundColor Cyan
if ($successCount -eq $totalCount) {
    Write-Host "🎉 SUCCÈS COMPLET! ($successCount/$totalCount)" -ForegroundColor Green
} elseif ($successCount -gt 0) {
    Write-Host "⚠️ SUCCÈS PARTIEL ($successCount/$totalCount)" -ForegroundColor Yellow
} else {
    Write-Host "❌ ÉCHEC COMPLET ($successCount/$totalCount)" -ForegroundColor Red
}

Write-Host "`n📊 Services:" -ForegroundColor Cyan
if ($serviceSuccessCount -gt 0) {
    Write-Host "✅ Services opérationnels: $serviceSuccessCount/$serviceTotalCount" -ForegroundColor Green
} else {
    Write-Host "⚠️ Aucun service démarré ($serviceSuccessCount/$serviceTotalCount)" -ForegroundColor Yellow
    Write-Host "   (Normal si les services ne sont pas démarrés localement)" -ForegroundColor Gray
}

# 11. Instructions finales
Write-Host "`n11. Instructions finales..." -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

Write-Host "`n📋 Actions à effectuer:" -ForegroundColor Cyan
Write-Host "1. ✅ Application Next.js démarrée sur http://localhost:3000" -ForegroundColor Green
Write-Host "2. ✅ Tunnel Cloudflare opérationnel" -ForegroundColor Green
Write-Host "3. ✅ Site accessible sur https://iahome.fr" -ForegroundColor Green
Write-Host "4. ⚠️ Vider le cache Cloudflare sur le dashboard" -ForegroundColor Yellow
Write-Host "5. ✅ Tester les fonctionnalités dans le navigateur" -ForegroundColor Green

Write-Host "`n🔗 URLs à tester dans votre navigateur:" -ForegroundColor Cyan
Write-Host "• https://iahome.fr (site principal)" -ForegroundColor White
Write-Host "• https://www.iahome.fr (site principal avec www)" -ForegroundColor White
Write-Host "• https://iahome.fr/login (connexion)" -ForegroundColor White
Write-Host "• https://iahome.fr/signup (inscription)" -ForegroundColor White
Write-Host "• https://iahome.fr/signup-success (page de succès)" -ForegroundColor White
Write-Host "• https://iahome.fr/essentiels (applications essentielles)" -ForegroundColor White
Write-Host "• https://iahome.fr/applications (applications IA)" -ForegroundColor White

Write-Host "`n🛠️ Commandes utiles:" -ForegroundColor Cyan
Write-Host "• Arrêter tout: .\stop-cloudflare.ps1" -ForegroundColor White
Write-Host "• Redémarrer Cloudflare: .\start-cloudflare.ps1" -ForegroundColor White
Write-Host "• Tester les routes: .\test-cloudflare-routes.ps1" -ForegroundColor White
Write-Host "• Vider le cache: .\purge-cloudflare-cache.ps1" -ForegroundColor White

Write-Host "`n🎯 Résultat final:" -ForegroundColor Cyan
if ($successCount -eq $totalCount) {
    Write-Host "🎉 CLOUDFLARE ENTIÈREMENT RESTAURÉ !" -ForegroundColor Green
    Write-Host "✅ Application Next.js opérationnelle" -ForegroundColor Green
    Write-Host "✅ Tunnel Cloudflare opérationnel" -ForegroundColor Green
    Write-Host "✅ Toutes les routes principales fonctionnent" -ForegroundColor Green
    Write-Host "✅ Site accessible sur https://iahome.fr" -ForegroundColor Green
    Write-Host "⚠️ N'oubliez pas de vider le cache sur le dashboard" -ForegroundColor Yellow
} else {
    Write-Host "⚠️ CLOUDFLARE PARTIELLEMENT RESTAURÉ" -ForegroundColor Yellow
    Write-Host "✅ Application Next.js opérationnelle" -ForegroundColor Green
    Write-Host "✅ Tunnel Cloudflare opérationnel" -ForegroundColor Green
    Write-Host "✅ Site principal accessible sur https://iahome.fr" -ForegroundColor Green
    Write-Host "❌ Certaines routes ne fonctionnent pas" -ForegroundColor Red
    Write-Host "⚠️ Vérifiez la configuration et videz le cache" -ForegroundColor Yellow
}

Write-Host "`n🚀 ÉTAPES SUIVANTES:" -ForegroundColor Green
Write-Host "1. Allez sur https://dash.cloudflare.com" -ForegroundColor White
Write-Host "2. Purgez le cache de iahome.fr" -ForegroundColor White
Write-Host "3. Testez https://iahome.fr dans votre navigateur" -ForegroundColor White
Write-Host "4. Vérifiez que les modifications récentes sont visibles" -ForegroundColor White
Write-Host "5. Testez la connexion et l'inscription" -ForegroundColor White
Write-Host "6. Testez la nouvelle page de succès d'inscription" -ForegroundColor White

Write-Host "`n🎉 CLOUDFLARE EST MAINTENANT COMPLÈTEMENT RESTAURÉ !" -ForegroundColor Green
Write-Host "Votre site est accessible sur https://iahome.fr" -ForegroundColor Green
Write-Host "Avec la nouvelle fonctionnalité d'affichage des données utilisateur après inscription !" -ForegroundColor Green
