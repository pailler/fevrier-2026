# Script pour démarrer Docker Desktop et toutes les applications
Write-Host "🚀 Démarrage de Docker Desktop et des applications" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Vérifier si Docker Desktop est installé
$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (Test-Path $dockerPath) {
    Write-Host "`n1. Démarrage de Docker Desktop..." -ForegroundColor Yellow
    
    # Vérifier si Docker Desktop est déjà en cours d'exécution
    $dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
    if ($dockerProcess) {
        Write-Host "   ✅ Docker Desktop est déjà en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "   🔄 Lancement de Docker Desktop..." -ForegroundColor Yellow
        Start-Process -FilePath $dockerPath
        Write-Host "   ⏳ Attente du démarrage de Docker Desktop (30 secondes)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        # Vérifier que Docker est prêt
        $maxAttempts = 10
        $attempt = 0
        $dockerReady = $false
        
        while ($attempt -lt $maxAttempts -and -not $dockerReady) {
            $attempt++
            try {
                $dockerInfo = docker info 2>$null
                if ($LASTEXITCODE -eq 0) {
                    $dockerReady = $true
                    Write-Host "   ✅ Docker Desktop est prêt" -ForegroundColor Green
                } else {
                    Write-Host "   ⏳ Tentative $attempt/$maxAttempts - Attente..." -ForegroundColor Yellow
                    Start-Sleep -Seconds 5
                }
            } catch {
                Write-Host "   ⏳ Tentative $attempt/$maxAttempts - Attente..." -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            }
        }
        
        if (-not $dockerReady) {
            Write-Host "   ⚠️  Docker Desktop semble prendre du temps à démarrer" -ForegroundColor Yellow
            Write-Host "   💡 Tu peux continuer manuellement une fois Docker Desktop démarré" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "`n⚠️  Docker Desktop n'est pas trouvé au chemin standard" -ForegroundColor Yellow
    Write-Host "   💡 Démarre Docker Desktop manuellement" -ForegroundColor Cyan
}

# Attendre un peu avant de démarrer les applications
Write-Host "`n2. Vérification de Docker avant de démarrer les applications..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $dockerStatus = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker est opérationnel" -ForegroundColor Green
        
        # Démarrer les applications
        Write-Host "`n3. Démarrage des applications..." -ForegroundColor Yellow
        & ".\start-all-essentiels.ps1"
    } else {
        Write-Host "   ❌ Docker n'est pas encore prêt" -ForegroundColor Red
        Write-Host "   💡 Attends que Docker Desktop soit complètement démarré, puis exécute:" -ForegroundColor Cyan
        Write-Host "      .\start-all-essentiels.ps1" -ForegroundColor White
    }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification de Docker" -ForegroundColor Red
    Write-Host "   💡 Assure-toi que Docker Desktop est démarré, puis exécute:" -ForegroundColor Cyan
    Write-Host "      .\start-all-essentiels.ps1" -ForegroundColor White
}




