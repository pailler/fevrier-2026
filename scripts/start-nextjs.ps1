# Script pour demarrer l'application Next.js sur le port 3000

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE APPLICATION NEXT.JS" -ForegroundColor Cyan
Write-Host "  Port 3000 (iahome.fr)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$RootPath = Split-Path -Parent $PSScriptRoot

# Verifier l'environnement
Write-Host "[1/4] Verification de l'environnement..." -ForegroundColor Yellow
$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue

if (-not $node -or -not $npm) {
    Write-Host "   [ERREUR] Node.js ou npm non trouve" -ForegroundColor Red
    Write-Host "   Installez Node.js depuis: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "   [OK] Node.js: $($node.Version)" -ForegroundColor Green
Write-Host "   [OK] npm: $($npm.Version)" -ForegroundColor Green

$packageJson = Join-Path $RootPath "package.json"
if (-not (Test-Path $packageJson)) {
    Write-Host "   [ERREUR] package.json introuvable: $packageJson" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] package.json trouve" -ForegroundColor Green

# Arreter les processus existants sur le port 3000
Write-Host "`n[2/4] Arret des processus sur le port 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $proc = Get-Process -Id $port3000.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "   Arret du processus existant (PID: $($proc.Id))..." -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "   [OK] Processus arrete" -ForegroundColor Green
    }
} else {
    Write-Host "   [OK] Port 3000 libre" -ForegroundColor Green
}

# Verifier si node_modules existe
Write-Host "`n[3/4] Verification des dependances..." -ForegroundColor Yellow
$nodeModules = Join-Path $RootPath "node_modules"
if (-not (Test-Path $nodeModules)) {
    Write-Host "   [AVERTISSEMENT] node_modules introuvable" -ForegroundColor Yellow
    Write-Host "   Installation des dependances..." -ForegroundColor Gray
    Push-Location $RootPath
    npm install
    Pop-Location
    Write-Host "   [OK] Dependances installees" -ForegroundColor Green
} else {
    Write-Host "   [OK] Dependances deja installees" -ForegroundColor Green
}

# Demarrer Next.js
Write-Host "`n[4/4] Demarrage de Next.js..." -ForegroundColor Yellow
Write-Host "   Mode: production" -ForegroundColor Gray
Write-Host "   Port: 3000" -ForegroundColor Gray
Write-Host "   URL: http://localhost:3000" -ForegroundColor Gray

Push-Location $RootPath

try {
    # Configurer les variables d'environnement
    $env:NODE_ENV = "production"
    $env:PORT = "3000"
    
    # Demarrer Next.js
    $nextjsScript = @"
cd '$RootPath'
`$env:NODE_ENV='production'
`$env:PORT='3000'
npm start
"@
    
    $process = Start-Process powershell -ArgumentList "-NoExit", "-WindowStyle", "Normal", "-Command", $nextjsScript -PassThru -ErrorAction Stop
    
    if ($process) {
        Write-Host "   [OK] Next.js demarre (PID: $($process.Id))" -ForegroundColor Green
        Write-Host "   Une fenetre PowerShell s'est ouverte pour afficher les logs" -ForegroundColor Gray
        
        Write-Host "`n   [INFO] Attente du demarrage (15 secondes)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
        
        # Verifier que l'application repond
        $maxRetries = 6
        $retryCount = 0
        $isRunning = $false
        
        while ($retryCount -lt $maxRetries -and -not $isRunning) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
                if ($response.StatusCode -eq 200) {
                    $isRunning = $true
                    Write-Host "   [OK] Application accessible (HTTP $($response.StatusCode))" -ForegroundColor Green
                }
            } catch {
                $retryCount++
                if ($retryCount -lt $maxRetries) {
                    Write-Host "   [INFO] Attente... ($retryCount/$maxRetries)" -ForegroundColor Gray
                    Start-Sleep -Seconds 5
                }
            }
        }
        
        if ($isRunning) {
            Write-Host "`n========================================" -ForegroundColor Green
            Write-Host "  APPLICATION NEXT.JS DEMARREE" -ForegroundColor Green
            Write-Host "========================================`n" -ForegroundColor Green
            
            Write-Host "[SUCCES] Application accessible sur:" -ForegroundColor Cyan
            Write-Host "   Local: http://localhost:3000" -ForegroundColor White
            Write-Host "   Production: https://iahome.fr" -ForegroundColor White
            Write-Host "   PID: $($process.Id)" -ForegroundColor White
            
        } else {
            Write-Host "   [AVERTISSEMENT] L'application ne repond pas encore" -ForegroundColor Yellow
            Write-Host "   Verifiez la fenetre PowerShell qui s'est ouverte" -ForegroundColor Gray
            Write-Host "   L'application peut prendre quelques minutes pour demarrer" -ForegroundColor Gray
        }
        
    } else {
        Write-Host "   [ERREUR] Impossible de demarrer Next.js" -ForegroundColor Red
    }
    
} catch {
    Write-Host "   [ERREUR] Exception: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Type: $($_.Exception.GetType().FullName)" -ForegroundColor Gray
} finally {
    Pop-Location
}

Write-Host "`nAppuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")














