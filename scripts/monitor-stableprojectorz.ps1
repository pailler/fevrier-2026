# Script de surveillance pour Hunyuan3D (interface Gradio)
# Vérifie périodiquement si le service est en cours d'exécution et le redémarre si nécessaire
Write-Host "🔍 Surveillance de Hunyuan3D (Gradio) démarrée..." -ForegroundColor Cyan
Write-Host "   Le script vérifiera toutes les 5 minutes si le service est actif" -ForegroundColor Gray
Write-Host "   Appuyez sur Ctrl+C pour arrêter la surveillance" -ForegroundColor Yellow
Write-Host ""

# Utiliser le script Gradio (interface web) au lieu de l'API
$scriptPath = "C:\Users\AAA\Documents\iahome\hunyuan2-spz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"

# Fallback vers l'ancienne version si la nouvelle n'existe pas
if (-not (Test-Path $scriptPath)) {
    $scriptPath = "C:\Users\AAA\Documents\iahome\v16_hunyuan2-stableprojectorz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"
}
$workingDir = Split-Path $scriptPath
$checkInterval = 300  # 5 minutes

function CheckAndStartService {
    $portInUse = netstat -ano | findstr ":8888"
    
    if ($portInUse) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✅ Service Hunyuan3D Gradio actif sur le port 8888" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ⚠️  Service Hunyuan3D Gradio non détecté, redémarrage..." -ForegroundColor Yellow
        
        # Vérifier si le script existe
        if (-not (Test-Path $scriptPath)) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ❌ Script non trouvé: $scriptPath" -ForegroundColor Red
            return $false
        }
        
        # Redémarrer le service
        try {
            Set-Location $workingDir
            Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"$scriptPath`"" -WindowStyle Minimized
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✅ Commande de démarrage exécutée" -ForegroundColor Green
            Write-Host "   Attente de 60 secondes pour le démarrage..." -ForegroundColor Gray
            Start-Sleep -Seconds 60
            
            # Vérifier si le service a démarré
            $portInUse = netstat -ano | findstr ":8888"
            if ($portInUse) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✅ Service redémarré avec succès" -ForegroundColor Green
                return $true
            } else {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ⚠️  Service pas encore accessible (le chargement peut prendre plusieurs minutes)" -ForegroundColor Yellow
                return $false
            }
        } catch {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ❌ Erreur lors du redémarrage: $_" -ForegroundColor Red
            return $false
        }
    }
}

# Boucle de surveillance
while ($true) {
    CheckAndStartService | Out-Null
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Prochaine vérification dans $($checkInterval / 60) minutes..." -ForegroundColor Gray
    Write-Host ""
    Start-Sleep -Seconds $checkInterval
}

