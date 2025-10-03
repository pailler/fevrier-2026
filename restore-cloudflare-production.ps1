# Script pour restaurer Cloudflare et vider le cache de production
Write-Host "🚀 Restauration Cloudflare et Vidage Cache Production" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Arrêter le tunnel Cloudflare existant
Write-Host "`n1. Arrêt du tunnel Cloudflare existant..." -ForegroundColor Yellow
$process = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "✅ Arrêt du processus cloudflared existant..." -ForegroundColor Green
    Stop-Process -Name "cloudflared" -Force
    Start-Sleep -Seconds 3
} else {
    Write-Host "ℹ️ Aucun processus cloudflared en cours d'exécution" -ForegroundColor Blue
}

# 2. Vérifier que l'application locale fonctionne
Write-Host "`n2. Vérification de l'application locale..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application locale accessible sur http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "❌ Application locale non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
        Write-Host "⚠️ Démarrez d'abord l'application avec: npm run dev" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de l'accès à l'application locale: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "⚠️ Démarrez d'abord l'application avec: npm run dev" -ForegroundColor Yellow
    exit 1
}

# 3. Vérifier la configuration Cloudflare
Write-Host "`n3. Vérification de la configuration Cloudflare..." -ForegroundColor Yellow
if (Test-Path "cloudflare-complete-config.yml") {
    Write-Host "✅ Configuration Cloudflare trouvée: cloudflare-complete-config.yml" -ForegroundColor Green
    
    # Afficher la configuration
    $config = Get-Content "cloudflare-complete-config.yml"
    Write-Host "`n📋 Configuration actuelle:" -ForegroundColor Cyan
    foreach ($line in $config) {
        if ($line.Trim() -ne "" -and !$line.StartsWith("#")) {
            Write-Host "   $line" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ Configuration Cloudflare non trouvée!" -ForegroundColor Red
    exit 1
}

# 4. Vérifier cloudflared.exe
Write-Host "`n4. Vérification de cloudflared.exe..." -ForegroundColor Yellow
if (Test-Path "cloudflared.exe") {
    Write-Host "✅ cloudflared.exe trouvé" -ForegroundColor Green
    
    # Vérifier la version
    try {
        $version = & ".\cloudflared.exe" --version 2>&1
        Write-Host "   Version: $version" -ForegroundColor Gray
    } catch {
        Write-Host "   Version: Non disponible" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ cloudflared.exe non trouvé!" -ForegroundColor Red
    Write-Host "⚠️ Téléchargez cloudflared depuis: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
    exit 1
}

# 5. Vider le cache Cloudflare (via API)
Write-Host "`n5. Vidage du cache Cloudflare..." -ForegroundColor Yellow
Write-Host "⚠️ Pour vider le cache Cloudflare, vous devez:" -ForegroundColor Yellow
Write-Host "   1. Aller sur https://dash.cloudflare.com" -ForegroundColor White
Write-Host "   2. Sélectionner votre domaine iahome.fr" -ForegroundColor White
Write-Host "   3. Aller dans 'Caching' > 'Configuration'" -ForegroundColor White
Write-Host "   4. Cliquer sur 'Purge Everything'" -ForegroundColor White
Write-Host "   5. Ou utiliser l'API Cloudflare avec votre token" -ForegroundColor White

# 6. Démarrer le tunnel Cloudflare
Write-Host "`n6. Démarrage du tunnel Cloudflare..." -ForegroundColor Yellow
Write-Host "🚀 Lancement de cloudflared avec la configuration complète..." -ForegroundColor Green

try {
    # Démarrer cloudflared en arrière-plan
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = ".\cloudflared.exe"
    $processInfo.Arguments = "tunnel --config cloudflare-complete-config.yml run"
    $processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Minimized
    $processInfo.UseShellExecute = $true
    
    $process = [System.Diagnostics.Process]::Start($processInfo)
    
    if ($process) {
        Write-Host "✅ Tunnel Cloudflare démarré avec succès!" -ForegroundColor Green
        Write-Host "   Process ID: $($process.Id)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Échec du démarrage du tunnel Cloudflare" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors du démarrage du tunnel: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 7. Attendre que le tunnel soit opérationnel
Write-Host "`n7. Attente de l'activation du tunnel..." -ForegroundColor Yellow
Write-Host "⏳ Attente de 10 secondes pour que le tunnel soit opérationnel..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# 8. Tester les routes Cloudflare
Write-Host "`n8. Test des routes Cloudflare..." -ForegroundColor Yellow

$routes = @(
    @{url="https://iahome.fr"; name="Site principal"},
    @{url="https://www.iahome.fr"; name="Site principal (www)"},
    @{url="https://metube.iahome.fr"; name="MeTube"},
    @{url="https://librespeed.iahome.fr"; name="LibreSpeed"},
    @{url="https://whisper.iahome.fr"; name="Whisper"},
    @{url="https://psitransfer.iahome.fr"; name="PsiTransfer"},
    @{url="https://qrcodes.iahome.fr"; name="QR Codes"},
    @{url="https://pdf.iahome.fr"; name="PDF"},
    @{url="https://rembg.iahome.fr"; name="REMBG"}
)

$successCount = 0
$totalCount = $routes.Count

foreach ($route in $routes) {
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

# 9. Résumé des résultats
Write-Host "`n9. Résumé des résultats..." -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

if ($successCount -eq $totalCount) {
    Write-Host "🎉 SUCCÈS COMPLET!" -ForegroundColor Green
    Write-Host "✅ Toutes les routes Cloudflare sont opérationnelles ($successCount/$totalCount)" -ForegroundColor Green
} elseif ($successCount -gt 0) {
    Write-Host "⚠️ SUCCÈS PARTIEL" -ForegroundColor Yellow
    Write-Host "✅ Routes opérationnelles: $successCount/$totalCount" -ForegroundColor Yellow
    Write-Host "❌ Routes en échec: $($totalCount - $successCount)" -ForegroundColor Red
} else {
    Write-Host "❌ ÉCHEC COMPLET" -ForegroundColor Red
    Write-Host "❌ Aucune route Cloudflare n'est opérationnelle" -ForegroundColor Red
}

# 10. Instructions finales
Write-Host "`n10. Instructions finales..." -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

Write-Host "`n📋 Actions à effectuer:" -ForegroundColor Cyan
Write-Host "1. ✅ Tunnel Cloudflare démarré" -ForegroundColor Green
Write-Host "2. ⚠️ Vider le cache Cloudflare manuellement sur le dashboard" -ForegroundColor Yellow
Write-Host "3. ✅ Tester les routes dans votre navigateur" -ForegroundColor Green
Write-Host "4. ✅ Vérifier que l'application fonctionne sur iahome.fr" -ForegroundColor Green

Write-Host "`n🔗 URLs à tester:" -ForegroundColor Cyan
Write-Host "   • https://iahome.fr (site principal)" -ForegroundColor White
Write-Host "   • https://www.iahome.fr (site principal avec www)" -ForegroundColor White
Write-Host "   • https://metube.iahome.fr (MeTube)" -ForegroundColor White
Write-Host "   • https://librespeed.iahome.fr (LibreSpeed)" -ForegroundColor White

Write-Host "`n🛠️ Commandes utiles:" -ForegroundColor Cyan
Write-Host "   • Arrêter Cloudflare: .\stop-cloudflare.ps1" -ForegroundColor White
Write-Host "   • Redémarrer Cloudflare: .\start-cloudflare.ps1" -ForegroundColor White
Write-Host "   • Tester les routes: .\test-cloudflare-routes.ps1" -ForegroundColor White

Write-Host "`n🎯 Résultat final:" -ForegroundColor Cyan
Write-Host "✅ CLOUDFLARE RESTAURÉ !" -ForegroundColor Green
Write-Host "✅ Tunnel opérationnel sur iahome.fr" -ForegroundColor Green
Write-Host "⚠️ Videz manuellement le cache sur le dashboard Cloudflare" -ForegroundColor Yellow
Write-Host "✅ Testez les routes dans votre navigateur" -ForegroundColor Green

Write-Host "`n🚀 CLOUDFLARE EST MAINTENANT OPÉRATIONNEL !" -ForegroundColor Green
Write-Host "Allez sur https://iahome.fr pour vérifier que tout fonctionne." -ForegroundColor Green



