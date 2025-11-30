# Script pour passer en mode production et démarrer tous les services

Write-Host "🚀 PASSAGE EN MODE PRODUCTION" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 1. Arrêter tous les processus de développement
Write-Host "1️⃣ Arrêt des processus de développement..." -ForegroundColor Yellow
$devProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*next dev*" -or $_.Path -like "*node*"
}
if ($devProcesses) {
    Write-Host "   ⏹️  Arrêt de $($devProcesses.Count) processus de développement..." -ForegroundColor Gray
    $devProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
        } catch {
            Write-Host "      ⚠️  Erreur lors de l'arrêt du processus $($_.Id)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 3
    Write-Host "   ✅ Processus de développement arrêtés" -ForegroundColor Green
} else {
    Write-Host "   ✅ Aucun processus de développement à arrêter" -ForegroundColor Green
}

# 2. Vérifier que le build existe
Write-Host "`n2️⃣ Vérification du build..." -ForegroundColor Yellow
if (-not (Test-Path ".next")) {
    Write-Host "   ⚠️  Le dossier .next n'existe pas. Reconstruction..." -ForegroundColor Yellow
    $env:NODE_ENV = "production"
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Build réussi!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors du build" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Gray
        exit 1
    }
} else {
    Write-Host "   ✅ Build trouvé" -ForegroundColor Green
}

# 3. Vérifier les fichiers statiques
Write-Host "`n3️⃣ Vérification des fichiers statiques..." -ForegroundColor Yellow
$staticDirs = @(".next/static", ".next/static/chunks", ".next/static/css")
$allPresent = $true
foreach ($dir in $staticDirs) {
    if (Test-Path $dir) {
        $fileCount = (Get-ChildItem -Path $dir -Recurse -File -ErrorAction SilentlyContinue).Count
        Write-Host "   ✅ $dir : $fileCount fichiers" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $dir : MANQUANT!" -ForegroundColor Red
        $allPresent = $false
    }
}

if (-not $allPresent) {
    Write-Host "   ⚠️  Certains fichiers statiques sont manquants. Reconstruction..." -ForegroundColor Yellow
    $env:NODE_ENV = "production"
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Reconstruction réussie!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de la reconstruction" -ForegroundColor Red
        exit 1
    }
}

# 4. Arrêter Next.js en production s'il est déjà en cours
Write-Host "`n4️⃣ Vérification de Next.js en production..." -ForegroundColor Yellow
$prodProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*next start*" -or (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue | Where-Object LocalPort -eq 3000)
}
if ($prodProcesses) {
    Write-Host "   ⏹️  Arrêt des processus Next.js existants..." -ForegroundColor Gray
    $prodProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
        } catch {
            Write-Host "      ⚠️  Erreur lors de l'arrêt du processus $($_.Id)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 3
    Write-Host "   ✅ Processus arrêtés" -ForegroundColor Green
}

# 5. Définir les variables d'environnement pour la production
Write-Host "`n5️⃣ Configuration de l'environnement de production..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
$env:PORT = "3000"
Write-Host "   ✅ NODE_ENV = production" -ForegroundColor Green
Write-Host "   ✅ PORT = 3000" -ForegroundColor Green

# 6. Démarrer Next.js en mode production
Write-Host "`n6️⃣ Démarrage de Next.js en mode production..." -ForegroundColor Yellow
Write-Host "   🚀 Lancement sur http://localhost:3000..." -ForegroundColor Gray

try {
    $command = "cd '$PWD'; `$env:NODE_ENV='production'; `$env:PORT='3000'; npm start"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $command -WindowStyle Minimized
    Start-Sleep -Seconds 10
    
    # Vérifier que Next.js répond
    $maxRetries = 6
    $retryCount = 0
    $isRunning = $false
    
    while ($retryCount -lt $maxRetries -and -not $isRunning) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $isRunning = $true
                Write-Host "   ✅ Next.js répond : HTTP $($response.StatusCode)" -ForegroundColor Green
            }
        } catch {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Write-Host "   ⏳ Attente du démarrage... ($retryCount/$maxRetries)" -ForegroundColor Gray
                Start-Sleep -Seconds 5
            }
        }
    }
    
    if (-not $isRunning) {
        Write-Host "   ⚠️  Next.js ne répond pas encore (peut prendre quelques secondes)" -ForegroundColor Yellow
        Write-Host "   💡 Vérifiez manuellement : http://localhost:3000" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Erreur lors du démarrage de Next.js: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 7. Vérifier Cloudflare
Write-Host "`n7️⃣ Vérification de Cloudflare Tunnel..." -ForegroundColor Yellow
$cloudflareProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflareProcess) {
    Write-Host "   ✅ Cloudflare Tunnel est en cours d'exécution (PID: $($cloudflareProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Cloudflare Tunnel n'est pas en cours d'exécution" -ForegroundColor Yellow
    Write-Host "   💡 Pour démarrer Cloudflare, exécutez :" -ForegroundColor Gray
    Write-Host "      cloudflared tunnel --config cloudflare-active-config.yml run" -ForegroundColor Gray
    $startCloudflare = Read-Host "   Voulez-vous démarrer Cloudflare maintenant ? (O/N)"
    if ($startCloudflare -eq "O" -or $startCloudflare -eq "o") {
        Write-Host "   🚀 Démarrage de Cloudflare..." -ForegroundColor Gray
        $cloudflareCmd = "cd '$PWD'; cloudflared tunnel --config cloudflare-active-config.yml run"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $cloudflareCmd -WindowStyle Minimized
        Start-Sleep -Seconds 5
        Write-Host "   ✅ Cloudflare démarré" -ForegroundColor Green
    }
}

# 8. Vérifier les services Docker (optionnel)
Write-Host "`n8️⃣ Vérification des services Docker..." -ForegroundColor Yellow
try {
    $dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
    if ($dockerProcess) {
        Write-Host "   ✅ Docker Desktop est en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Docker Desktop n'est pas en cours d'exécution" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ℹ️  Impossible de vérifier Docker" -ForegroundColor Gray
}

# 9. Résumé
Write-Host "`n📊 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host "   ✅ Mode production activé" -ForegroundColor Green
Write-Host "   ✅ Next.js démarré en production (http://localhost:3000)" -ForegroundColor Green
if ($cloudflareProcess -or $startCloudflare -eq "O" -or $startCloudflare -eq "o") {
    Write-Host "   ✅ Cloudflare Tunnel actif" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Cloudflare Tunnel non démarré" -ForegroundColor Yellow
}
Write-Host "`n🌐 URLs de production:" -ForegroundColor Cyan
Write-Host "   - Local: http://localhost:3000" -ForegroundColor Gray
Write-Host "   - Production: https://iahome.fr" -ForegroundColor Gray
Write-Host "`n💡 Pour arrêter Next.js en production, fermez la fenêtre PowerShell ou utilisez:" -ForegroundColor Yellow
Write-Host "   Get-Process -Name node | Stop-Process -Force" -ForegroundColor Gray
Write-Host ""

