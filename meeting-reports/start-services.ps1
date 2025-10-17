# Script de démarrage des services Meeting Reports
Write-Host "🚀 Démarrage des services Meeting Reports Generator" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Cyan

# Fonction pour vérifier si un port est libre
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -eq $null
}

# Fonction pour arrêter les processus sur un port
function Stop-ProcessOnPort {
    param([int]$Port)
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($processes) {
        foreach ($pid in $processes) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "✅ Processus arrêté sur le port $Port (PID: $pid)" -ForegroundColor Green
            } catch {
                Write-Host "⚠️  Impossible d'arrêter le processus $pid sur le port $Port" -ForegroundColor Yellow
            }
        }
    }
}

# Arrêter les processus existants
Write-Host "🛑 Arrêt des processus existants..." -ForegroundColor Yellow
Stop-ProcessOnPort -Port 8001
Stop-ProcessOnPort -Port 3001
Start-Sleep -Seconds 3

# Démarrer le backend
Write-Host "`n🔧 Démarrage du backend..." -ForegroundColor Cyan
if (Test-Port -Port 8001) {
    Set-Location "backend"
    $backendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        python main-simple.py
    }
    Write-Host "✅ Backend démarré en arrière-plan (Job ID: $($backendJob.Id))" -ForegroundColor Green
    
    # Attendre que le backend soit prêt
    Write-Host "⏳ Attente du démarrage du backend..." -ForegroundColor Yellow
    $timeout = 30
    $elapsed = 0
    do {
        Start-Sleep -Seconds 2
        $elapsed += 2
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Backend opérationnel" -ForegroundColor Green
                break
            }
        } catch {
            # Continue waiting
        }
    } while ($elapsed -lt $timeout)
    
    if ($elapsed -ge $timeout) {
        Write-Host "⚠️  Timeout du démarrage du backend" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Port 8001 déjà utilisé" -ForegroundColor Red
}

# Démarrer le frontend
Write-Host "`n🎨 Démarrage du frontend..." -ForegroundColor Cyan
if (Test-Port -Port 3001) {
    Set-Location "..\frontend"
    
    # Définir les variables d'environnement
    $env:PORT = "3001"
    $env:HOST = "0.0.0.0"
    $env:DANGEROUSLY_DISABLE_HOST_CHECK = "true"
    $env:REACT_APP_API_URL = "https://meeting-reports.iahome.fr/api"
    
    Write-Host "🔧 Configuration frontend:" -ForegroundColor White
    Write-Host "   PORT: $env:PORT" -ForegroundColor Gray
    Write-Host "   HOST: $env:HOST" -ForegroundColor Gray
    Write-Host "   API_URL: $env:REACT_APP_API_URL" -ForegroundColor Gray
    
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        $env:PORT = "3001"
        $env:HOST = "0.0.0.0"
        $env:DANGEROUSLY_DISABLE_HOST_CHECK = "true"
        $env:REACT_APP_API_URL = "https://meeting-reports.iahome.fr/api"
        npm start
    }
    Write-Host "✅ Frontend démarré en arrière-plan (Job ID: $($frontendJob.Id))" -ForegroundColor Green
    
    # Attendre que le frontend soit prêt
    Write-Host "⏳ Attente du démarrage du frontend..." -ForegroundColor Yellow
    $timeout = 60
    $elapsed = 0
    do {
        Start-Sleep -Seconds 3
        $elapsed += 3
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Frontend opérationnel" -ForegroundColor Green
                break
            }
        } catch {
            # Continue waiting
        }
    } while ($elapsed -lt $timeout)
    
    if ($elapsed -ge $timeout) {
        Write-Host "⚠️  Timeout du démarrage du frontend" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Port 3001 déjà utilisé" -ForegroundColor Red
}

# Afficher le statut final
Write-Host "`n📊 Statut des services:" -ForegroundColor Cyan
Write-Host "=" * 30 -ForegroundColor Cyan

# Vérifier le backend
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8001/health" -TimeoutSec 5
    Write-Host "✅ Backend: Opérationnel (http://localhost:8001)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend: Non accessible" -ForegroundColor Red
}

# Vérifier le frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5
    Write-Host "✅ Frontend: Opérationnel (http://localhost:3001)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: Non accessible" -ForegroundColor Red
}

Write-Host "`n🌐 URLs d'accès:" -ForegroundColor Yellow
Write-Host "   Local: http://localhost:3001" -ForegroundColor White
Write-Host "   Domaine: https://meeting-reports.iahome.fr" -ForegroundColor White
Write-Host "   API: https://meeting-reports.iahome.fr/api" -ForegroundColor White
Write-Host "   Docs: https://meeting-reports.iahome.fr/api/docs" -ForegroundColor White

Write-Host "`n🛑 Pour arrêter les services:" -ForegroundColor Red
Write-Host "   Get-Job | Stop-Job" -ForegroundColor White
Write-Host "   Get-Job | Remove-Job" -ForegroundColor White

Write-Host "`n✨ Services démarrés !" -ForegroundColor Green
