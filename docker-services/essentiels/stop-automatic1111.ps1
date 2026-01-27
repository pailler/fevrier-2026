# Script pour arrêter Automatic1111 (Stable Diffusion WebUI)
Write-Host "Arrêt d'Automatic1111..." -ForegroundColor Yellow

# Chercher les processus Python qui exécutent Automatic1111
$processes = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*automatic1111*" -or 
    $_.CommandLine -like "*stable-diffusion-webui*" -or
    $_.CommandLine -like "*webui.py*" -or
    $_.CommandLine -like "*launch.py*"
}

if ($processes) {
    Write-Host "Processus Automatic1111 trouvés:" -ForegroundColor Cyan
    foreach ($proc in $processes) {
        Write-Host "  - PID: $($proc.Id) - $($proc.ProcessName)" -ForegroundColor Yellow
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Processus Automatic1111 arrêtés" -ForegroundColor Green
} else {
    # Alternative: chercher par port (7860 par défaut)
    Write-Host "Recherche de processus utilisant le port 7860..." -ForegroundColor Cyan
    $portProcess = Get-NetTCPConnection -LocalPort 7860 -ErrorAction SilentlyContinue | 
        Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($portProcess) {
        foreach ($processId in $portProcess) {
            $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "Arrêt du processus PID $processId ($($proc.ProcessName))..." -ForegroundColor Yellow
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Host "Processus arrêtés" -ForegroundColor Green
    } else {
        Write-Host "Aucun processus Automatic1111 trouvé" -ForegroundColor Yellow
        Write-Host "Automatic1111 n'est probablement pas en cours d'exécution" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "Vérification finale..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

$remaining = Get-NetTCPConnection -LocalPort 7860 -ErrorAction SilentlyContinue
if ($remaining) {
    Write-Host "Attention: Le port 7860 est toujours utilisé" -ForegroundColor Yellow
} else {
    Write-Host "Automatic1111 a été arrêté avec succès" -ForegroundColor Green
}
