# Script pour suivre la progression d'Automatic1111 en temps réel
Write-Host "👀 Suivi en temps réel d'Automatic1111" -ForegroundColor Cyan
Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Yellow
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$automatic1111Dir = Join-Path $scriptDir "automatic1111"

$iteration = 0
while ($true) {
    $iteration++
    Clear-Host
    Write-Host "👀 Suivi Automatic1111 - Mise à jour #$iteration - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
    
    # Vérifier le port
    $portOpen = $false
    $portConnection = Get-NetTCPConnection -LocalPort 7860 -ErrorAction SilentlyContinue
    if ($portConnection -and $portConnection.State -eq "Listen") {
        $portOpen = $true
        Write-Host "✅ Automatic1111 est DÉMARRÉ et accessible!" -ForegroundColor Green
        Write-Host "🌐 Interface web: http://localhost:7860" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Appuyez sur Ctrl+C pour arrêter le suivi" -ForegroundColor Yellow
        break
    }
    
    # Processus
    Write-Host "📊 Processus:" -ForegroundColor Yellow
    $processes = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
        $_.Path -like "*automatic1111*"
    }
    if ($processes) {
        foreach ($proc in $processes) {
            $mem = [math]::Round($proc.WorkingSet64 / 1MB, 1)
            Write-Host "   ✅ PID $($proc.Id) - Mémoire: ${mem} MB" -ForegroundColor Green
        }
    } else {
        Write-Host "   ⏳ Recherche de processus..." -ForegroundColor Yellow
    }
    
    # Venv
    Write-Host "`n📦 Environnement virtuel:" -ForegroundColor Yellow
    $venvDir = Join-Path $automatic1111Dir "venv"
    if (Test-Path $venvDir) {
        $venvSize = (Get-ChildItem -Path $venvDir -Recurse -ErrorAction SilentlyContinue | 
            Measure-Object -Property Length -Sum).Sum / 1GB
        $venvSize = [math]::Round($venvSize, 2)
        Write-Host "   Taille: ${venvSize} GB" -ForegroundColor Cyan
        
        $torchPath = Join-Path $venvDir "Lib\site-packages\torch"
        if (Test-Path $torchPath) {
            Write-Host "   ✅ PyTorch installé" -ForegroundColor Green
        } else {
            Write-Host "   ⏳ PyTorch en cours d'installation..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⏳ Création du venv..." -ForegroundColor Yellow
    }
    
    # Port
    Write-Host "`n🔌 Port 7860:" -ForegroundColor Yellow
    if ($portOpen) {
        Write-Host "   ✅ Port ouvert et en écoute" -ForegroundColor Green
    } else {
        Write-Host "   ⏳ Port pas encore ouvert (installation en cours)" -ForegroundColor Yellow
    }
    
    # Logs récents
    Write-Host "`n📝 Dernières lignes des logs:" -ForegroundColor Yellow
    $stdoutFile = Join-Path $automatic1111Dir "tmp\stdout.txt"
    if (Test-Path $stdoutFile) {
        $lastLines = Get-Content $stdoutFile -Tail 5 -ErrorAction SilentlyContinue
        if ($lastLines) {
            foreach ($line in $lastLines) {
                if ($line.Length -gt 80) {
                    $line = $line.Substring(0, 80) + "..."
                }
                Write-Host "   $line" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   ⏳ Aucun log disponible pour le moment" -ForegroundColor Yellow
    }
    
    # Estimation
    Write-Host "`n📈 Progression:" -ForegroundColor Yellow
    if (Test-Path $venvDir) {
        $venvSize = (Get-ChildItem -Path $venvDir -Recurse -ErrorAction SilentlyContinue | 
            Measure-Object -Property Length -Sum).Sum / 1GB
        $venvSize = [math]::Round($venvSize, 2)
        $estimatedTotal = 4.0
        $progress = [math]::Min(100, [math]::Round(($venvSize / $estimatedTotal) * 100, 1))
        
        $barLength = 40
        $filled = [math]::Round(($progress / 100) * $barLength)
        $bar = "[" + ("█" * $filled) + ("░" * ($barLength - $filled)) + "]"
        Write-Host "   $bar $progress%" -ForegroundColor Cyan
    }
    
    Write-Host "`n⏱️  Prochaine mise à jour dans 5 secondes..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}
