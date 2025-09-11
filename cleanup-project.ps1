# Script de nettoyage du projet iAhome
# Usage: .\cleanup-project.ps1

Write-Host "🧹 Nettoyage du projet iAhome..." -ForegroundColor Blue
Write-Host ""

# Arrêter les processus Node.js
Write-Host "1. Arrêt des processus Node.js..." -ForegroundColor Yellow
try {
    taskkill /F /IM node.exe 2>$null
    Write-Host "✅ Processus Node.js arrêtés" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  Aucun processus Node.js en cours" -ForegroundColor Blue
}

# Supprimer les dossiers de cache
Write-Host ""
Write-Host "2. Suppression des dossiers de cache..." -ForegroundColor Yellow

$cacheFolders = @(".next", "node_modules", ".cache", "dist", "build", "out")
foreach ($folder in $cacheFolders) {
    if (Test-Path $folder) {
        Remove-Item -Recurse -Force $folder
        Write-Host "✅ Supprimé: $folder" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Non trouvé: $folder" -ForegroundColor Blue
    }
}

# Supprimer les fichiers de cache
Write-Host ""
Write-Host "3. Suppression des fichiers de cache..." -ForegroundColor Yellow

$cacheFiles = @("package-lock.json", "yarn.lock", "*.log", "*.tmp")
foreach ($pattern in $cacheFiles) {
    Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item -Force $_
        Write-Host "✅ Supprimé: $_" -ForegroundColor Green
    }
}

# Supprimer les fichiers de documentation temporaires
Write-Host ""
Write-Host "4. Suppression des fichiers temporaires..." -ForegroundColor Yellow

$tempFiles = @(
    "GIT_PUSH_SUCCESS.md",
    "REBUILD_SUCCESS.md", 
    "DIAGNOSTIC_AUTH.md",
    "TEST_INTEGRATION.md",
    "RESOLUTION_*.md",
    "CORRECTION_INTEGRATION.md",
    "DEPANNAGE_AUTH.md",
    "TEST_AUTHENTICATION.md",
    "ACCES_*.md",
    "test-*.html",
    "test-*.js",
    "test-*.sql",
    "test-*.yml"
)

foreach ($pattern in $tempFiles) {
    Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item -Force $_
        Write-Host "✅ Supprimé: $_" -ForegroundColor Green
    }
}

# Supprimer les dossiers de développement
Write-Host ""
Write-Host "5. Suppression des dossiers de développement..." -ForegroundColor Yellow

$devFolders = @(".vscode", ".idea", "temp", "tmp", "logs")
foreach ($folder in $devFolders) {
    if (Test-Path $folder) {
        Remove-Item -Recurse -Force $folder
        Write-Host "✅ Supprimé: $folder" -ForegroundColor Green
    }
}

# Nettoyer le cache npm
Write-Host ""
Write-Host "6. Nettoyage du cache npm..." -ForegroundColor Yellow
try {
    npm cache clean --force
    Write-Host "✅ Cache npm nettoyé" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erreur lors du nettoyage du cache npm" -ForegroundColor Yellow
}

# Réinstaller les dépendances
Write-Host ""
Write-Host "7. Réinstallation des dépendances..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dépendances réinstallées" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erreur lors de l'installation des dépendances" -ForegroundColor Yellow
}

# Vérifier l'espace disque libéré
Write-Host ""
Write-Host "8. Vérification de l'espace disque..." -ForegroundColor Yellow
$diskSpace = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
$freeSpaceGB = [math]::Round($diskSpace.FreeSpace / 1GB, 2)
Write-Host "💾 Espace libre sur C: $freeSpaceGB GB" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Nettoyage terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "Pour redémarrer le projet :" -ForegroundColor Blue
Write-Host "npm run dev" -ForegroundColor White
