# Script de réparation de Hunyuan3D
# Vérifie et corrige les problèmes de configuration et de démarrage

Write-Host "🔧 Réparation de Hunyuan3D..." -ForegroundColor Cyan
Write-Host ""

# Étape 1: Arrêter les processus existants
Write-Host "1️⃣  Arrêt des processus existants..." -ForegroundColor Yellow
$processes = Get-Process | Where-Object { 
    $_.Path -like "*hunyuan*" -or 
    $_.Path -like "*stableprojectorz*" -or
    ($_.CommandLine -like "*hunyuan*" -and $_.ProcessName -eq "python") -or
    ($_.CommandLine -like "*gradio*" -and $_.ProcessName -eq "python")
}

if ($processes) {
    $processes | ForEach-Object {
        try {
            $cmdline = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
            if ($cmdline -like "*hunyuan*" -or $cmdline -like "*gradio*" -or $cmdline -like "*stableprojectorz*") {
                Write-Host "   Arrêt du processus PID $($_.Id)..." -ForegroundColor Gray
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            }
        } catch {
            # Ignorer les erreurs
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Processus arrêtés" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Aucun processus à arrêter" -ForegroundColor Gray
}

Write-Host ""

# Étape 2: Vérifier la structure
Write-Host "2️⃣  Vérification de la structure..." -ForegroundColor Yellow
$hunyuanPath = Join-Path $PSScriptRoot "hunyuan2-spz"
if (-not (Test-Path $hunyuanPath)) {
    Write-Host "   ❌ Dossier hunyuan2-spz non trouvé!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Dossier trouvé: $hunyuanPath" -ForegroundColor Green

$requiredPaths = @(
    "run-projectorz_(faster)",
    "run-browser_(slower)",
    "tools",
    "code"
)

foreach ($path in $requiredPaths) {
    $fullPath = Join-Path $hunyuanPath $path
    if (Test-Path $fullPath) {
        Write-Host "   ✅ $path" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $path manquant!" -ForegroundColor Red
    }
}

Write-Host ""

# Étape 3: Vérifier le port par défaut dans gradio_app.py
Write-Host "3️⃣  Vérification de la configuration du port..." -ForegroundColor Yellow
$gradioApp = Join-Path $hunyuanPath "code\gradio_app.py"
if (Test-Path $gradioApp) {
    $content = Get-Content $gradioApp -Raw
    if ($content -match "default=8888") {
        Write-Host "   ✅ Port par défaut configuré sur 8888" -ForegroundColor Green
    } elseif ($content -match "default=8080") {
        Write-Host "   ⚠️  Port encore sur 8080, correction..." -ForegroundColor Yellow
        $content = $content -replace "default=8080", "default=8888"
        Set-Content -Path $gradioApp -Value $content -NoNewline
        Write-Host "   ✅ Port corrigé à 8888" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Port par défaut non trouvé" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ gradio_app.py non trouvé!" -ForegroundColor Red
}

Write-Host ""

# Étape 4: Vérifier Cloudflared
Write-Host "4️⃣  Vérification de la configuration Cloudflared..." -ForegroundColor Yellow
$cloudflareConfig = Join-Path $PSScriptRoot "cloudflare-active-config.yml"
if (Test-Path $cloudflareConfig) {
    $configContent = Get-Content $cloudflareConfig -Raw
    if ($configContent -match "hunyuan3d\.iahome\.fr" -and $configContent -match "localhost:8888") {
        Write-Host "   ✅ Configuration Cloudflared correcte (port 8888)" -ForegroundColor Green
    } elseif ($configContent -match "hunyuan3d\.iahome\.fr" -and $configContent -match "localhost:7960") {
        Write-Host "   ⚠️  Port Cloudflared incorrect (7960), correction..." -ForegroundColor Yellow
        $configContent = $configContent -replace "localhost:7960", "localhost:8888"
        Set-Content -Path $cloudflareConfig -Value $configContent -NoNewline
        Write-Host "   ✅ Configuration Cloudflared corrigée" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Configuration Hunyuan3D non trouvée dans Cloudflared" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Fichier cloudflare-active-config.yml non trouvé" -ForegroundColor Yellow
}

Write-Host ""

# Étape 5: Vérifier que le port 8888 est libre
Write-Host "5️⃣  Vérification du port 8888..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "   ⚠️  Port 8888 utilisé par PID $($portInUse.OwningProcess)" -ForegroundColor Yellow
    $proc = Get-Process -Id $portInUse.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "   Processus: $($proc.ProcessName)" -ForegroundColor Gray
        $cmdline = (Get-CimInstance Win32_Process -Filter "ProcessId = $($portInUse.OwningProcess)" -ErrorAction SilentlyContinue).CommandLine
        if ($cmdline -notlike "*hunyuan*" -and $cmdline -notlike "*gradio*") {
            Write-Host "   ⚠️  Port utilisé par un autre service, arrêt..." -ForegroundColor Yellow
            Stop-Process -Id $portInUse.OwningProcess -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
    }
} else {
    Write-Host "   ✅ Port 8888 libre" -ForegroundColor Green
}

Write-Host ""

# Étape 6: Relancer le service
Write-Host "6️⃣  Relance du service..." -ForegroundColor Yellow
Write-Host "   Exécution de start-hunyuan3d.ps1..." -ForegroundColor Gray
Write-Host ""

# Exécuter le script de démarrage
& "$PSScriptRoot\start-hunyuan3d.ps1"

Write-Host ""
Write-Host "✅ Réparation terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Résumé:" -ForegroundColor Cyan
Write-Host "   • Processus arrêtés et relancés" -ForegroundColor White
Write-Host "   • Configuration vérifiée et corrigée" -ForegroundColor White
Write-Host "   • Service relancé sur le port 8888" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Le service peut prendre plusieurs minutes pour démarrer complètement" -ForegroundColor Yellow
Write-Host "   (téléchargement des modèles si première exécution)" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 URLs d'accès:" -ForegroundColor Cyan
Write-Host "   • Local: http://localhost:8888" -ForegroundColor White
Write-Host "   • Production: https://hunyuan3d.iahome.fr" -ForegroundColor White
Write-Host ""


