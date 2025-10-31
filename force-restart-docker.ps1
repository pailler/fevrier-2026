# Script pour FORCER le redémarrage complet de Docker Desktop
# Redémarre Docker Desktop même s'il est déjà en cours d'exécution

Write-Host "🐳 Redémarrage FORCÉ de Docker Desktop..." -ForegroundColor Cyan

# Fonction pour vérifier si Docker fonctionne
function Test-DockerRunning {
    try {
        docker ps 2>&1 | Out-Null
        return $true
    } catch {
        return $false
    }
}

# 1. Arrêter TOUS les processus Docker
Write-Host "`n1️⃣ Arrêt de TOUS les processus Docker..." -ForegroundColor Yellow

$dockerProcesses = @(
    "Docker Desktop",
    "com.docker.backend",
    "com.docker.build",
    "docker-buildx",
    "docker-compose",
    "vpnkit",
    "com.docker.proxy",
    "com.docker.driver",
    "com.docker.cli"
)

$stoppedCount = 0
foreach ($processName in $dockerProcesses) {
    $processes = Get-Process -Name $processName -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($proc in $processes) {
            try {
                Write-Host "   Arrêt de: $processName (PID: $($proc.Id))" -ForegroundColor Gray
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                $stoppedCount++
            } catch {
                Write-Host "   ⚠️ Impossible d'arrêter PID: $($proc.Id)" -ForegroundColor Yellow
            }
        }
    }
}

# Arrêter aussi tous les processus docker génériques
$allDockerProcs = Get-Process -Name "*docker*" -ErrorAction SilentlyContinue
foreach ($proc in $allDockerProcs) {
    try {
        if ($stoppedCount -eq 0 -or $stoppedCount % 5 -eq 0) {
            Write-Host "   Arrêt de: $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Gray
        }
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        $stoppedCount++
    } catch {
        # Ignorer les erreurs silencieusement
    }
}

Write-Host "   ✅ $stoppedCount processus Docker arrêtés" -ForegroundColor Green
Write-Host "   ⏳ Attente de 8 secondes pour la fermeture complète..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# 2. Vérifier qu'il n'y a plus de processus Docker
Write-Host "`n2️⃣ Vérification qu'il ne reste aucun processus Docker..." -ForegroundColor Yellow
$remainingProcesses = Get-Process -Name "*docker*" -ErrorAction SilentlyContinue
if ($remainingProcesses) {
    Write-Host "   ⚠️ $($remainingProcesses.Count) processus résiduels détectés, nettoyage..." -ForegroundColor Yellow
    $remainingProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        } catch {
            # Forcer l'arrêt avec taskkill si nécessaire
            Start-Process -FilePath "taskkill" -ArgumentList "/F", "/PID", $_.Id -WindowStyle Hidden -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 3
} else {
    Write-Host "   ✅ Tous les processus Docker ont été arrêtés" -ForegroundColor Green
}

# 3. Trouver Docker Desktop
Write-Host "`n3️⃣ Recherche de Docker Desktop..." -ForegroundColor Yellow

$dockerDesktopPaths = @(
    "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
    "${env:LOCALAPPDATA}\Programs\Docker\Docker\Docker Desktop.exe",
    "$env:ProgramW6432\Docker\Docker\Docker Desktop.exe"
)

$dockerDesktopPath = $null
foreach ($path in $dockerDesktopPaths) {
    if (Test-Path $path) {
        $dockerDesktopPath = $path
        Write-Host "   ✅ Docker Desktop trouvé: $path" -ForegroundColor Green
        break
    }
}

# Recherche alternative via le menu démarrer
if (-not $dockerDesktopPath) {
    $startMenuPath = "${env:APPDATA}\Microsoft\Windows\Start Menu\Programs\Docker\Docker Desktop.lnk"
    if (Test-Path $startMenuPath) {
        $shell = New-Object -ComObject WScript.Shell
        $shortcut = $shell.CreateShortcut($startMenuPath)
        if (Test-Path $shortcut.TargetPath) {
            $dockerDesktopPath = $shortcut.TargetPath
            Write-Host "   ✅ Docker Desktop trouvé via le menu démarrer" -ForegroundColor Green
        }
    }
}

if (-not $dockerDesktopPath) {
    Write-Host "   ❌ Docker Desktop non trouvé!" -ForegroundColor Red
    Write-Host "   💡 Recherche dans tous les emplacements possibles..." -ForegroundColor Yellow
    
    # Recherche élargie
    $searchPaths = @(
        "$env:ProgramFiles",
        "$env:ProgramFiles (x86)",
        "$env:ProgramW6432",
        "${env:LOCALAPPDATA}\Programs"
    )
    
    foreach ($searchPath in $searchPaths) {
        if (Test-Path $searchPath) {
            $found = Get-ChildItem -Path $searchPath -Filter "Docker Desktop.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($found) {
                $dockerDesktopPath = $found.FullName
                Write-Host "   ✅ Docker Desktop trouvé: $dockerDesktopPath" -ForegroundColor Green
                break
            }
        }
    }
}

if (-not $dockerDesktopPath) {
    Write-Host "   ❌ Docker Desktop introuvable!" -ForegroundColor Red
    Write-Host "   💡 Essayez de démarrer Docker Desktop manuellement depuis le menu démarrer" -ForegroundColor Yellow
    Write-Host "   💡 Ou téléchargez-le depuis: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# 4. Démarrer Docker Desktop
Write-Host "`n4️⃣ Démarrage de Docker Desktop..." -ForegroundColor Yellow
try {
    Write-Host "   Lancement: $dockerDesktopPath" -ForegroundColor Gray
    
    # Démarrer Docker Desktop
    Start-Process -FilePath $dockerDesktopPath -WindowStyle Normal
    
    Write-Host "   ✅ Commande de démarrage envoyée" -ForegroundColor Green
    Write-Host "   ⏳ Attente du démarrage complet..." -ForegroundColor Yellow
    
    # Attendre que Docker soit prêt
    $maxWait = 45
    $waited = 0
    $started = $false
    
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 3
        $waited += 3
        
        # Vérifier si Docker Desktop est visible
        $dockerDesktopProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
        if ($dockerDesktopProcess) {
            Write-Host "   ✓ Docker Desktop visible (PID: $($dockerDesktopProcess[0].Id))" -ForegroundColor Gray
        }
        
        # Vérifier si Docker répond
        if (Test-DockerRunning) {
            $started = $true
            Write-Host "   ✅ Docker est opérationnel!" -ForegroundColor Green
            break
        }
        
        if ($waited % 6 -eq 0) {
            Write-Host "   ⏳ En attente... ($waited/$maxWait secondes)" -ForegroundColor Gray
        }
    }
    
    if ($started) {
        Write-Host "   ✅ Docker répond aux commandes" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Docker prend plus de temps à démarrer" -ForegroundColor Yellow
        Write-Host "   💡 Vérifiez l'interface Docker Desktop manuellement" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Essayez de démarrer Docker Desktop manuellement" -ForegroundColor Yellow
    exit 1
}

# 5. Vérification finale
Write-Host "`n5️⃣ Vérification finale..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

if (Test-DockerRunning) {
    $dockerVersion = docker --version 2>&1
    $containerCount = (docker ps -q 2>&1).Count
    $imageCount = (docker images -q 2>&1).Count
    
    Write-Host "   ✅ Docker Desktop est opérationnel!" -ForegroundColor Green
    Write-Host "   📊 Version: $dockerVersion" -ForegroundColor Cyan
    Write-Host "   📦 Conteneurs actifs: $containerCount" -ForegroundColor Cyan
    Write-Host "   🖼️ Images: $imageCount" -ForegroundColor Cyan
    
    # Afficher les conteneurs en cours
    if ($containerCount -gt 0) {
        Write-Host "`n   📋 Conteneurs actifs:" -ForegroundColor Yellow
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>&1 | Select-Object -First 10
    }
    
    Write-Host "`n✅ Docker Desktop a été redémarré avec succès!" -ForegroundColor Green
} else {
    $dockerDesktopProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
    if ($dockerDesktopProcess) {
        Write-Host "   ⚠️ Docker Desktop est lancé mais ne répond pas encore aux commandes" -ForegroundColor Yellow
        Write-Host "   💡 Attendez encore quelques secondes, Docker peut prendre du temps à démarrer complètement" -ForegroundColor Yellow
        Write-Host "   💡 Vérifiez l'interface Docker Desktop" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Docker Desktop ne semble pas avoir démarré" -ForegroundColor Red
        Write-Host "   💡 Vérifiez manuellement si Docker Desktop est visible" -ForegroundColor Yellow
    }
}

Write-Host "`n💡 Commandes utiles:" -ForegroundColor Cyan
Write-Host "   - Vérifier l'état: docker ps" -ForegroundColor Gray
Write-Host "   - Voir toutes les images: docker images" -ForegroundColor Gray
Write-Host "   - Info système: docker info" -ForegroundColor Gray
Write-Host "   - Arrêter Docker: Get-Process '*docker*' | Stop-Process -Force" -ForegroundColor Gray






