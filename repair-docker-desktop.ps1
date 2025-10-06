# Script de réparation Docker Desktop - Problèmes WSL
Write-Host "🔧 Réparation de Docker Desktop..." -ForegroundColor Cyan

# 1. Arrêter tous les processus WSL
Write-Host "`n1️⃣ Arrêt des processus WSL..." -ForegroundColor Yellow
try {
    $wslProcesses = Get-Process -Name "wsl" -ErrorAction SilentlyContinue
    if ($wslProcesses) {
        Write-Host "📊 Processus WSL trouvés: $($wslProcesses.Count)" -ForegroundColor Gray
        $wslProcesses | ForEach-Object { 
            Write-Host "  - PID $($_.Id): $($_.ProcessName)" -ForegroundColor Gray
        }
        $wslProcesses | Stop-Process -Force
        Write-Host "✅ Processus WSL arrêtés" -ForegroundColor Green
    } else {
        Write-Host "✅ Aucun processus WSL trouvé" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Erreur lors de l'arrêt des processus WSL: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 2. Arrêter Docker Desktop
Write-Host "`n2️⃣ Arrêt de Docker Desktop..." -ForegroundColor Yellow
try {
    $dockerProcesses = Get-Process -Name "*docker*" -ErrorAction SilentlyContinue
    if ($dockerProcesses) {
        Write-Host "📊 Processus Docker trouvés: $($dockerProcesses.Count)" -ForegroundColor Gray
        $dockerProcesses | Stop-Process -Force
        Write-Host "✅ Docker Desktop arrêté" -ForegroundColor Green
    } else {
        Write-Host "✅ Docker Desktop déjà arrêté" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Erreur lors de l'arrêt de Docker: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 3. Arrêter WSL proprement
Write-Host "`n3️⃣ Arrêt propre de WSL..." -ForegroundColor Yellow
try {
    wsl --shutdown
    Write-Host "✅ WSL arrêté proprement" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erreur lors de l'arrêt de WSL: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. Attendre que tout soit arrêté
Write-Host "`n4️⃣ Attente de l'arrêt complet..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 5. Vérifier qu'il n'y a plus de processus
Write-Host "`n5️⃣ Vérification des processus restants..." -ForegroundColor Yellow
$remainingWsl = Get-Process -Name "wsl" -ErrorAction SilentlyContinue
$remainingDocker = Get-Process -Name "*docker*" -ErrorAction SilentlyContinue

if ($remainingWsl) {
    Write-Host "⚠️ Processus WSL restants: $($remainingWsl.Count)" -ForegroundColor Yellow
    $remainingWsl | ForEach-Object { 
        Write-Host "  - PID $($_.Id): $($_.ProcessName)" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ Aucun processus WSL restant" -ForegroundColor Green
}

if ($remainingDocker) {
    Write-Host "⚠️ Processus Docker restants: $($remainingDocker.Count)" -ForegroundColor Yellow
    $remainingDocker | ForEach-Object { 
        Write-Host "  - PID $($_.Id): $($_.ProcessName)" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ Aucun processus Docker restant" -ForegroundColor Green
}

# 6. Redémarrer Docker Desktop
Write-Host "`n6️⃣ Redémarrage de Docker Desktop..." -ForegroundColor Yellow
try {
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "✅ Docker Desktop redémarré" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du redémarrage de Docker Desktop: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 7. Attendre le démarrage
Write-Host "`n7️⃣ Attente du démarrage de Docker Desktop..." -ForegroundColor Yellow
Write-Host "⏳ Attente de 60 secondes..." -ForegroundColor Gray
Start-Sleep -Seconds 60

# 8. Tester Docker
Write-Host "`n8️⃣ Test de Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "✅ Docker version: $dockerVersion" -ForegroundColor Green
    
    $containers = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker fonctionne correctement" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Docker en cours de démarrage..." -ForegroundColor Yellow
        Write-Host "💡 Relancez ce script dans quelques minutes si nécessaire" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Erreur lors du test de Docker: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Réparation terminée!" -ForegroundColor Green
Write-Host "💡 Si Docker ne fonctionne toujours pas, redémarrez votre ordinateur" -ForegroundColor Cyan






