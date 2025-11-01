# Script de restauration complète du tunnel Cloudflare
# Arrête les processus existants, vérifie la configuration et redémarre le tunnel

Write-Host "🔧 RESTAURATION CLOUDFLARE" -ForegroundColor Cyan
Write-Host "=========================`n" -ForegroundColor Cyan

# 1. Arrêter tous les processus cloudflared
Write-Host "1️⃣ Arrêt de tous les processus cloudflared..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | ForEach-Object {
        Write-Host "   ⏹️  Arrêt du processus PID: $($_.Id)" -ForegroundColor Gray
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
        } catch {
            Write-Host "      ⚠️  Erreur lors de l'arrêt (peut nécessiter des droits admin): $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 3
    Write-Host "   ✅ Tous les processus arrêtés" -ForegroundColor Green
} else {
    Write-Host "   ✅ Aucun processus à arrêter" -ForegroundColor Green
}

# 2. Vérifier que cloudflared.exe existe
Write-Host "`n2️⃣ Vérification de cloudflared..." -ForegroundColor Yellow
$cloudflaredExe = ".\cloudflared.exe"
if (-not (Test-Path $cloudflaredExe)) {
    Write-Host "   ❌ cloudflared.exe non trouvé dans le répertoire courant!" -ForegroundColor Red
    Write-Host "   💡 Exécutez d'abord: .\update-cloudflared.ps1" -ForegroundColor Yellow
    exit 1
}
try {
    $version = & $cloudflaredExe --version 2>&1
    Write-Host "   ✅ Cloudflared détecté: $version" -ForegroundColor Green
    Write-Host "   📍 Chemin: $(Resolve-Path $cloudflaredExe)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Erreur lors de la vérification de cloudflared: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Vérifier la configuration
Write-Host "`n3️⃣ Vérification de la configuration..." -ForegroundColor Yellow
$configFile = "cloudflare-active-config.yml"
if (-not (Test-Path $configFile)) {
    Write-Host "   ❌ Fichier de configuration non trouvé: $configFile" -ForegroundColor Red
    Write-Host "   💡 Vérifiez que le fichier existe dans le répertoire courant" -ForegroundColor Yellow
    exit 1
}
$configPath = Resolve-Path $configFile
Write-Host "   ✅ Configuration trouvée: $configPath" -ForegroundColor Green

# Vérifier le fichier de credentials
$configContent = Get-Content $configPath -Raw
if ($configContent -match "credentials-file:\s*(.+)$") {
    $credPath = $matches[1].Trim()
    if (-not (Test-Path $credPath)) {
        Write-Host "   ⚠️  Fichier de credentials non trouvé: $credPath" -ForegroundColor Yellow
        Write-Host "   💡 Le tunnel peut ne pas fonctionner sans ce fichier" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Fichier de credentials trouvé: $credPath" -ForegroundColor Green
    }
}

# 4. Vérifier les services locaux critiques
Write-Host "`n4️⃣ Vérification des services locaux..." -ForegroundColor Yellow
$criticalServices = @(
    @{Name="iahome.fr (Next.js)"; Port=3000; Required=$true}
)
$optionalServices = @(
    @{Name="qrcodes"; Port=7006; Required=$false},
    @{Name="whisper"; Port=8093; Required=$false},
    @{Name="librespeed"; Port=8085; Required=$false},
    @{Name="psitransfer"; Port=8087; Required=$false},
    @{Name="metube"; Port=8081; Required=$false},
    @{Name="pdf"; Port=8086; Required=$false},
    @{Name="meeting-reports"; Port=3050; Required=$false}
)

$allOk = $true
Write-Host "   Services critiques:" -ForegroundColor Gray
foreach ($svc in $criticalServices) {
    $listening = netstat -ano 2>&1 | Select-String ":$($svc.Port)\s+" | Select-String "LISTENING"
    if ($listening) {
        Write-Host "      ✅ Port $($svc.Port) ($($svc.Name)) - Écoute" -ForegroundColor Green
    } else {
        Write-Host "      ❌ Port $($svc.Port) ($($svc.Name)) - NON ACCESSIBLE!" -ForegroundColor Red
        if ($svc.Required) {
            $allOk = $false
            Write-Host "      ⚠️  Le tunnel ne pourra pas fonctionner sans ce service!" -ForegroundColor Yellow
        }
    }
}

Write-Host "   Services optionnels:" -ForegroundColor Gray
foreach ($svc in $optionalServices) {
    $listening = netstat -ano 2>&1 | Select-String ":$($svc.Port)\s+" | Select-String "LISTENING"
    if ($listening) {
        Write-Host "      ✅ Port $($svc.Port) ($($svc.Name)) - Actif" -ForegroundColor Green
    } else {
        Write-Host "      ℹ️  Port $($svc.Port) ($($svc.Name)) - Non démarré" -ForegroundColor Gray
    }
}

if (-not $allOk) {
    Write-Host "`n   ⚠️  Services critiques manquants détectés!" -ForegroundColor Yellow
    Write-Host "   💡 Démarrer le service manquant avant de continuer" -ForegroundColor Yellow
    Write-Host "   📋 Continuer quand même ? (O/N): " -ForegroundColor Yellow -NoNewline
    $continue = Read-Host
    if ($continue -ne "O" -and $continue -ne "o") {
        Write-Host "   ❌ Restauration annulée" -ForegroundColor Red
        exit 1
    }
}

# 5. Démarrer le tunnel
Write-Host "`n5️⃣ Démarrage du tunnel Cloudflare..." -ForegroundColor Yellow
try {
    Write-Host "   📋 Tunnel: iahome-new" -ForegroundColor Gray
    Write-Host "   📋 Configuration: $configPath" -ForegroundColor Gray
    Write-Host "   🚀 Lancement..." -ForegroundColor Gray
    
    $cloudflaredPath = Resolve-Path $cloudflaredExe
    Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel", "--config", "`"$configPath`"", "run", "iahome-new" -WindowStyle Hidden
    
    Write-Host "   ⏳ Attente de la connexion (15 secondes)..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
    
    # Vérifier le statut
    Write-Host "   🔍 Vérification du statut..." -ForegroundColor Gray
    $tunnelInfo = & $cloudflaredExe tunnel info iahome-new 2>&1
    if ($tunnelInfo -match "CONNECTOR ID" -or $tunnelInfo -match "connection") {
        Write-Host "   ✅ Tunnel actif et connecté!" -ForegroundColor Green
        $tunnelInfo | Select-String "VERSION|CONNECTOR ID" | ForEach-Object {
            Write-Host "      $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  Tunnel démarré mais pas encore connecté" -ForegroundColor Yellow
        Write-Host "   💡 Attendez quelques secondes supplémentaires" -ForegroundColor Gray
        Write-Host "   📋 Statut actuel:" -ForegroundColor Cyan
        Write-Host $tunnelInfo -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Vérifiez les logs pour plus de détails" -ForegroundColor Yellow
    exit 1
}

# 6. Test de connectivité
Write-Host "`n6️⃣ Test de connectivité via Cloudflare..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$testDomains = @(
    @{URL="https://iahome.fr"; Name="Domaine principal"},
    @{URL="https://qrcodes.iahome.fr"; Name="QR Codes"},
    @{URL="https://librespeed.iahome.fr"; Name="LibreSpeed"}
)

$successCount = 0
foreach ($test in $testDomains) {
    try {
        $response = Invoke-WebRequest -Uri $test.URL -Method Head -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ $($test.Name) ($($test.URL)) : HTTP $($response.StatusCode)" -ForegroundColor Green
        $successCount++
    } catch {
        $statusCode = "N/A"
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode.value__
        }
        if ($statusCode -eq 502 -or $statusCode -eq 503) {
            Write-Host "   ⚠️  $($test.Name) ($($test.URL)) : Erreur $statusCode (service peut être en cours de démarrage)" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ $($test.Name) ($($test.URL)) : Erreur $statusCode" -ForegroundColor Red
        }
    }
}

# 7. Résumé
Write-Host "`n📊 RÉSUMÉ DE LA RESTAURATION:" -ForegroundColor Cyan
Write-Host "   ✅ Tunnel Cloudflare redémarré" -ForegroundColor Green
if ($successCount -eq $testDomains.Count) {
    Write-Host "   ✅ Tous les tests de connectivité réussis" -ForegroundColor Green
} elseif ($successCount -gt 0) {
    Write-Host "   ⚠️  $successCount/$($testDomains.Count) tests réussis" -ForegroundColor Yellow
    Write-Host "   💡 Certains services peuvent être en cours de démarrage" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Aucun test de connectivité réussi" -ForegroundColor Yellow
    Write-Host "   💡 Le tunnel peut prendre quelques minutes pour se synchroniser" -ForegroundColor Gray
}

Write-Host "`n✅ Restauration terminée!" -ForegroundColor Green
Write-Host "`n💡 Commandes utiles:" -ForegroundColor Cyan
Write-Host "   - Vérifier le tunnel: .\cloudflared.exe tunnel info iahome-new" -ForegroundColor Gray
Write-Host "   - Diagnostic complet: .\diagnostic-cloudflare-complete.ps1" -ForegroundColor Gray
Write-Host "   - Redémarrer: .\restart-cloudflare-tunnel.ps1" -ForegroundColor Gray
Write-Host "   - Arrêter: Get-Process cloudflared | Stop-Process -Force" -ForegroundColor Gray
Write-Host ""

