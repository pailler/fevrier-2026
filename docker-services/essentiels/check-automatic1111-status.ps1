# Script pour suivre la progression d'Automatic1111
Write-Host "📊 Statut d'Automatic1111" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$automatic1111Dir = Join-Path $scriptDir "automatic1111"
$venvDir = Join-Path $automatic1111Dir "venv"

# 1. Vérifier si le processus est en cours d'exécution
Write-Host "`n1. Processus en cours..." -ForegroundColor Yellow
$processes = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*automatic1111*" -or 
    $_.CommandLine -like "*webui.py*" -or
    $_.CommandLine -like "*launch.py*"
}

if ($processes) {
    Write-Host "   ✅ Processus Automatic1111 trouvé:" -ForegroundColor Green
    foreach ($proc in $processes) {
        $cpu = [math]::Round($proc.CPU, 2)
        $mem = [math]::Round($proc.WorkingSet64 / 1MB, 2)
        Write-Host "      - PID: $($proc.Id) | CPU: ${cpu}s | Mémoire: ${mem} MB" -ForegroundColor White
    }
} else {
    # Vérifier par port
    $portProcess = Get-NetTCPConnection -LocalPort 7860 -ErrorAction SilentlyContinue | 
        Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($portProcess) {
        $proc = Get-Process -Id $portProcess -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "   ✅ Processus trouvé sur le port 7860 (PID: $($proc.Id))" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ Aucun processus Automatic1111 trouvé" -ForegroundColor Red
    }
}

# 2. Vérifier le venv
Write-Host "`n2. Environnement virtuel..." -ForegroundColor Yellow
if (Test-Path $venvDir) {
    $venvSize = (Get-ChildItem -Path $venvDir -Recurse -ErrorAction SilentlyContinue | 
        Measure-Object -Property Length -Sum).Sum / 1GB
    $venvSize = [math]::Round($venvSize, 2)
    Write-Host "   ✅ Venv existe (Taille: ${venvSize} GB)" -ForegroundColor Green
    
    # Vérifier si PyTorch est installé
    $torchPath = Join-Path $venvDir "Lib\site-packages\torch"
    if (Test-Path $torchPath) {
        Write-Host "   ✅ PyTorch installé" -ForegroundColor Green
    } else {
        Write-Host "   ⏳ PyTorch en cours d'installation..." -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Venv n'existe pas encore" -ForegroundColor Red
}

# 3. Vérifier le port
Write-Host "`n3. Port 7860..." -ForegroundColor Yellow
$portConnection = Get-NetTCPConnection -LocalPort 7860 -ErrorAction SilentlyContinue
if ($portConnection) {
    $state = $portConnection.State
    if ($state -eq "Listen") {
        Write-Host "   ✅ Port 7860 ouvert et en écoute" -ForegroundColor Green
        Write-Host "   🌐 Interface accessible sur: http://localhost:7860" -ForegroundColor Cyan
    } else {
        Write-Host "   ⏳ Port 7860 utilisé mais pas encore en écoute (État: $state)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⏳ Port 7860 pas encore ouvert (installation en cours)" -ForegroundColor Yellow
}

# 4. Vérifier les logs récents
Write-Host "`n4. Dernières activités..." -ForegroundColor Yellow
$logFiles = @(
    (Join-Path $automatic1111Dir "tmp\stdout.txt"),
    (Join-Path $automatic1111Dir "tmp\stderr.txt")
)

$hasActivity = $false
foreach ($logFile in $logFiles) {
    if (Test-Path $logFile) {
        $lastModified = (Get-Item $logFile).LastWriteTime
        $timeDiff = (Get-Date) - $lastModified
        if ($timeDiff.TotalSeconds -lt 60) {
            Write-Host "   ✅ Activité récente dans $([System.IO.Path]::GetFileName($logFile))" -ForegroundColor Green
            Write-Host "      (Dernière modification: il y a $([math]::Round($timeDiff.TotalSeconds)) secondes)" -ForegroundColor Gray
            
            # Afficher les dernières lignes
            $lastLines = Get-Content $logFile -Tail 3 -ErrorAction SilentlyContinue
            if ($lastLines) {
                Write-Host "      Dernières lignes:" -ForegroundColor Gray
                foreach ($line in $lastLines) {
                    if ($line.Length -gt 100) {
                        $line = $line.Substring(0, 100) + "..."
                    }
                    Write-Host "      $line" -ForegroundColor DarkGray
                }
            }
            $hasActivity = $true
        }
    }
}

if (-not $hasActivity) {
    Write-Host "   ⏳ Aucune activité récente détectée dans les logs" -ForegroundColor Yellow
}

# 5. Estimation de progression basée sur la taille du venv
Write-Host "`n5. Estimation de progression..." -ForegroundColor Yellow
if (Test-Path $venvDir) {
    $venvSize = (Get-ChildItem -Path $venvDir -Recurse -ErrorAction SilentlyContinue | 
        Measure-Object -Property Length -Sum).Sum / 1GB
    $venvSize = [math]::Round($venvSize, 2)
    
    # PyTorch seul fait environ 2.5 GB, les autres dépendances environ 1-2 GB
    # Total estimé: 3.5-4.5 GB
    $estimatedTotal = 4.0
    $progress = [math]::Min(100, [math]::Round(($venvSize / $estimatedTotal) * 100, 1))
    
    Write-Host "   Taille actuelle: ${venvSize} GB / ~${estimatedTotal} GB estimés" -ForegroundColor Cyan
    Write-Host "   Progression estimée: $progress%" -ForegroundColor Cyan
    
    # Barre de progression simple
    $barLength = 30
    $filled = [math]::Round(($progress / 100) * $barLength)
    $bar = "[" + ("=" * $filled) + (" " * ($barLength - $filled)) + "]"
    Write-Host "   $bar" -ForegroundColor Cyan
}

Write-Host "`n💡 Astuce: Relancez ce script pour suivre la progression en temps réel" -ForegroundColor Yellow
Write-Host "   Commande: .\check-automatic1111-status.ps1" -ForegroundColor Gray
