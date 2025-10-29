# Script de mise à jour automatique de cloudflared
# Ce script télécharge et installe la dernière version de cloudflared

Write-Host "🔄 Mise à jour de cloudflared..." -ForegroundColor Cyan

# Vérifier la version actuelle
try {
    $currentVersion = cloudflared --version 2>&1
    Write-Host "📊 Version actuelle: $currentVersion" -ForegroundColor Yellow
} catch {
    Write-Host "⚠️ Impossible de détecter la version actuelle" -ForegroundColor Yellow
}

# Arrêter les processus cloudflared existants
Write-Host "`n🛑 Arrêt des processus cloudflared existants..." -ForegroundColor Yellow
try {
    $processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($proc in $processes) {
            Write-Host "   Arrêt du processus PID: $($proc.Id)" -ForegroundColor Gray
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 3
        Write-Host "✅ Processus cloudflared arrêtés" -ForegroundColor Green
    } else {
        Write-Host "✅ Aucun processus cloudflared en cours" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Erreur lors de l'arrêt des processus: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Définir les chemins
$cloudflaredExe = ".\cloudflared.exe"
$cloudflaredBackup = ".\cloudflared.exe.backup"
$cloudflaredOld = ".\cloudflared.exe.old"
$tempDownload = "$env:TEMP\cloudflared-windows-amd64.exe"

# Sauvegarder l'ancienne version
Write-Host "`n💾 Sauvegarde de l'ancienne version..." -ForegroundColor Yellow
if (Test-Path $cloudflaredExe) {
    # Supprimer l'ancien backup s'il existe
    if (Test-Path $cloudflaredBackup) {
        Remove-Item $cloudflaredBackup -Force
    }
    
    # Déplacer l'ancien .old s'il existe vers le backup
    if (Test-Path $cloudflaredOld) {
        Move-Item $cloudflaredOld $cloudflaredBackup -Force
    }
    
    # Sauvegarder la version actuelle
    Copy-Item $cloudflaredExe $cloudflaredOld -Force
    Write-Host "✅ Version sauvegardée: $cloudflaredOld" -ForegroundColor Green
} else {
    Write-Host "⚠️ cloudflared.exe non trouvé dans le répertoire courant" -ForegroundColor Yellow
}

# Télécharger la dernière version
Write-Host "`n⬇️ Téléchargement de la dernière version de cloudflared..." -ForegroundColor Yellow

try {
    # Obtenir la dernière version depuis GitHub API
    Write-Host "   Récupération des informations de la dernière version..." -ForegroundColor Gray
    $latestRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/cloudflare/cloudflared/releases/latest"
    $latestVersion = $latestRelease.tag_name
    Write-Host "   Dernière version disponible: $latestVersion" -ForegroundColor Cyan
    
    # Trouver le binaire Windows amd64
    $windowsAsset = $latestRelease.assets | Where-Object { $_.name -like "*windows-amd64*" -and $_.name -notlike "*msi*" -and $_.name -like "*.exe" } | Select-Object -First 1
    
    if (-not $windowsAsset) {
        # Si pas de .exe direct, chercher le zip
        $windowsAsset = $latestRelease.assets | Where-Object { $_.name -like "*windows-amd64*" -and $_.name -like "*.zip" } | Select-Object -First 1
    }
    
    if (-not $windowsAsset) {
        throw "Aucun binaire Windows trouvé pour la version $latestVersion"
    }
    
    $downloadUrl = $windowsAsset.browser_download_url
    Write-Host "   Téléchargement depuis: $downloadUrl" -ForegroundColor Gray
    
    # Télécharger le fichier
    Write-Host "   Téléchargement en cours..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempDownload -UseBasicParsing
    
    Write-Host "✅ Téléchargement terminé" -ForegroundColor Green
    
    # Si c'est un ZIP, l'extraire
    if ($tempDownload -like "*.zip") {
        Write-Host "   Extraction de l'archive..." -ForegroundColor Gray
        $zipPath = $tempDownload
        $extractPath = "$env:TEMP\cloudflared-extract"
        
        if (Test-Path $extractPath) {
            Remove-Item $extractPath -Recurse -Force
        }
        New-Item -ItemType Directory -Path $extractPath -Force | Out-Null
        
        Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
        
        # Chercher cloudflared.exe dans le dossier extrait
        $extractedExe = Get-ChildItem -Path $extractPath -Filter "cloudflared.exe" -Recurse | Select-Object -First 1
        
        if ($extractedExe) {
            Copy-Item $extractedExe.FullName $tempDownload -Force
        } else {
            throw "cloudflared.exe non trouvé dans l'archive"
        }
    }
    
    # Vérifier que le fichier téléchargé existe
    if (-not (Test-Path $tempDownload)) {
        throw "Le fichier téléchargé n'existe pas"
    }
    
    $fileSize = (Get-Item $tempDownload).Length / 1MB
    Write-Host "   Taille du fichier: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Gray
    
    # Remplacer l'ancien fichier
    Write-Host "`n🔧 Installation de la nouvelle version..." -ForegroundColor Yellow
    if (Test-Path $cloudflaredExe) {
        Remove-Item $cloudflaredExe -Force
    }
    
    Copy-Item $tempDownload $cloudflaredExe -Force
    Write-Host "✅ Nouvelle version installée" -ForegroundColor Green
    
    # Nettoyer le fichier temporaire
    if (Test-Path $tempDownload) {
        Remove-Item $tempDownload -Force
    }
    if (Test-Path "$env:TEMP\cloudflared-extract") {
        Remove-Item "$env:TEMP\cloudflared-extract" -Recurse -Force
    }
    
    # Vérifier la nouvelle version
    Write-Host "`n🔍 Vérification de la nouvelle version..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    $newVersion = & .\cloudflared.exe --version 2>&1
    
    if ($newVersion) {
        Write-Host "✅ Nouvelle version installée:" -ForegroundColor Green
        Write-Host $newVersion -ForegroundColor Cyan
        
        Write-Host "`n🎉 Mise à jour terminée avec succès!" -ForegroundColor Green
        Write-Host "💡 Pour redémarrer le tunnel, exécutez: .\restore-cloudflare.ps1" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ Impossible de vérifier la nouvelle version" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "`n❌ Erreur lors de la mise à jour:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    # Restaurer la version précédente en cas d'erreur
    if (Test-Path $cloudflaredOld) {
        Write-Host "`n🔄 Restauration de l'ancienne version..." -ForegroundColor Yellow
        if (Test-Path $cloudflaredExe) {
            Remove-Item $cloudflaredExe -Force
        }
        Copy-Item $cloudflaredOld $cloudflaredExe -Force
        Write-Host "✅ Ancienne version restaurée" -ForegroundColor Green
    }
    
    # Nettoyer les fichiers temporaires
    if (Test-Path $tempDownload) {
        Remove-Item $tempDownload -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "$env:TEMP\cloudflared-extract") {
        Remove-Item "$env:TEMP\cloudflared-extract" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    exit 1
}

Write-Host "`n📝 Résumé:" -ForegroundColor Cyan
Write-Host "   - Version précédente sauvegardée: $cloudflaredOld" -ForegroundColor Gray
Write-Host "   - Nouvelle version installée: $cloudflaredExe" -ForegroundColor Gray
Write-Host "   - Pour restaurer l'ancienne version: Copiez $cloudflaredOld vers $cloudflaredExe" -ForegroundColor Gray


