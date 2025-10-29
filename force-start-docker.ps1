# Script pour forcer le démarrage de Docker Desktop
# Ce script arrête et redémarre Docker Desktop proprement

Write-Host "🐳 Démarrage forcé de Docker Desktop..." -ForegroundColor Cyan

# Fonction pour vérifier si Docker fonctionne
function Test-DockerRunning {
    try {
        docker ps 2>&1 | Out-Null
        return $true
    } catch {
        return $false
    }
}

# 1. Vérifier l'état actuel
Write-Host "`n1️⃣ Vérification de l'état actuel de Docker..." -ForegroundColor Yellow

$dockerDesktopRunning = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if ($dockerDesktopRunning) {
    Write-Host "   ✅ Docker Desktop est en cours d'exécution (PID: $($dockerDesktopRunning[0].Id))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Docker Desktop n'est pas en cours d'exécution" -ForegroundColor Red
}

# Tester si Docker répond
if (Test-DockerRunning) {
    $dockerVersion = docker --version 2>&1
    Write-Host "   ✅ Docker fonctionne: $dockerVersion" -ForegroundColor Green
    
    $containerCount = (docker ps -q 2>&1).Count
    Write-Host "   📊 $containerCount conteneurs actifs" -ForegroundColor Gray
    
    # Demander si on doit quand même redémarrer
    Write-Host "`n⚠️ Docker fonctionne déjà. Voulez-vous quand même le redémarrer ?" -ForegroundColor Yellow
    $restart = Read-Host "   (O/N)"
    
    if ($restart -ne "O" -and $restart -ne "o") {
        Write-Host "`n✅ Docker est déjà opérationnel. Aucune action nécessaire." -ForegroundColor Green
        exit 0
    }
} else {
    Write-Host "   ❌ Docker ne répond pas aux commandes" -ForegroundColor Red
}

# 2. Arrêter Docker Desktop proprement
Write-Host "`n2️⃣ Arrêt de Docker Desktop..." -ForegroundColor Yellow

# Arrêter tous les processus Docker
$dockerProcesses = @(
    "Docker Desktop",
    "com.docker.backend",
    "com.docker.build",
    "docker",
    "dockerd",
    "docker-engine"
)

$stoppedProcesses = @()
foreach ($processName in $dockerProcesses) {
    $processes = Get-Process -Name $processName -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($proc in $processes) {
            try {
                Write-Host "   Arrêt de: $processName (PID: $($proc.Id))" -ForegroundColor Gray
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                $stoppedProcesses += $proc.Id
            } catch {
                Write-Host "   ⚠️ Impossible d'arrêter $processName (PID: $($proc.Id))" -ForegroundColor Yellow
            }
        }
    }
}

if ($stoppedProcesses.Count -gt 0) {
    Write-Host "   ✅ $($stoppedProcesses.Count) processus arrêtés" -ForegroundColor Green
    Write-Host "   ⏳ Attente de 5 secondes pour la fermeture complète..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
} else {
    Write-Host "   ✅ Aucun processus Docker à arrêter" -ForegroundColor Green
}

# 3. Nettoyer les processus résiduels
Write-Host "`n3️⃣ Nettoyage des processus résiduels..." -ForegroundColor Yellow
$remainingProcesses = Get-Process -Name "*docker*" -ErrorAction SilentlyContinue
if ($remainingProcesses) {
    Write-Host "   ⚠️ $($remainingProcesses.Count) processus Docker résiduels détectés" -ForegroundColor Yellow
    $remainingProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Host "      Arrêt de PID: $($_.Id)" -ForegroundColor Gray
        } catch {
            Write-Host "      ⚠️ Impossible d'arrêter PID: $($_.Id)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 3
}

# 4. Trouver et démarrer Docker Desktop
Write-Host "`n4️⃣ Recherche de Docker Desktop..." -ForegroundColor Yellow

$dockerDesktopPaths = @(
    "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
    "$env:ProgramFiles\Docker\Docker\resources\com.docker.backend.exe",
    "${env:LOCALAPPDATA}\Docker\Docker Desktop.exe",
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

if (-not $dockerDesktopPath) {
    # Essayer de trouver via le registre ou le menu démarrer
    Write-Host "   🔍 Recherche alternative..." -ForegroundColor Gray
    $startMenuPath = "${env:APPDATA}\Microsoft\Windows\Start Menu\Programs\Docker\Docker Desktop.lnk"
    if (Test-Path $startMenuPath) {
        $shell = New-Object -ComObject WScript.Shell
        $shortcut = $shell.CreateShortcut($startMenuPath)
        $dockerDesktopPath = $shortcut.TargetPath
        Write-Host "   ✅ Docker Desktop trouvé via le menu démarrer" -ForegroundColor Green
    }
}

if (-not $dockerDesktopPath) {
    Write-Host "   ❌ Docker Desktop non trouvé!" -ForegroundColor Red
    Write-Host "   💡 Vérifiez que Docker Desktop est installé" -ForegroundColor Yellow
    Write-Host "   💡 Téléchargez-le depuis: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# 5. Démarrer Docker Desktop
Write-Host "`n5️⃣ Démarrage de Docker Desktop..." -ForegroundColor Yellow
try {
    Write-Host "   Lancement: $dockerDesktopPath" -ForegroundColor Gray
    Start-Process -FilePath $dockerDesktopPath -WindowStyle Normal
    
    Write-Host "   ✅ Commande de démarrage envoyée" -ForegroundColor Green
    Write-Host "   ⏳ Attente du démarrage complet (30 secondes)..." -ForegroundColor Yellow
    
    # Attendre que Docker démarre
    $maxWait = 30
    $waited = 0
    $started = $false
    
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 3
        $waited += 3
        
        if (Test-DockerRunning) {
            $started = $true
            Write-Host "   ✅ Docker est opérationnel!" -ForegroundColor Green
            break
        }
        
        Write-Host "   ⏳ Attente... ($waited/$maxWait secondes)" -ForegroundColor Gray
    }
    
    if (-not $started) {
        Write-Host "   ⚠️ Docker prend plus de temps à démarrer que prévu" -ForegroundColor Yellow
        Write-Host "   💡 Vérifiez manuellement si Docker Desktop est démarré" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Essayez de démarrer Docker Desktop manuellement" -ForegroundColor Yellow
    exit 1
}

# 6. Vérification finale
Write-Host "`n6️⃣ Vérification finale..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

if (Test-DockerRunning) {
    $dockerVersion = docker --version 2>&1
    $containerCount = (docker ps -q 2>&1).Count
    $imageCount = (docker images -q 2>&1).Count
    
    Write-Host "   ✅ Docker Desktop est opérationnel!" -ForegroundColor Green
    Write-Host "   📊 Version: $dockerVersion" -ForegroundColor Cyan
    Write-Host "   📦 Conteneurs actifs: $containerCount" -ForegroundColor Cyan
    Write-Host "   🖼️ Images: $imageCount" -ForegroundColor Cyan
    
    Write-Host "`n✅ Docker Desktop a été redémarré avec succès!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Docker ne répond pas encore aux commandes" -ForegroundColor Yellow
    Write-Host "   💡 Attendez quelques secondes supplémentaires ou vérifiez manuellement" -ForegroundColor Yellow
    Write-Host "   💡 L'interface Docker Desktop devrait être visible" -ForegroundColor Yellow
}

Write-Host "`n💡 Commandes utiles:" -ForegroundColor Cyan
Write-Host "   - Vérifier l'état: docker ps" -ForegroundColor Gray
Write-Host "   - Voir les logs: docker logs <container>" -ForegroundColor Gray
Write-Host "   - Voir l'info système: docker info" -ForegroundColor Gray

