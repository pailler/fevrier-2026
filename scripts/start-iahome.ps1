<#
.SYNOPSIS
    Demarre iahome en mode production Docker (sans rebuild).
.DESCRIPTION
    Si le conteneur existe deja, le demarre. Sinon, le cree et demarre.
    Utile apres un redemarrage Windows ou si les conteneurs ont ete arretes.
.EXAMPLE
    .\scripts\start-iahome.ps1
#>

$ProjectRoot = if ($PSScriptRoot) {
    Split-Path -Parent (Resolve-Path $PSScriptRoot)
} else {
    Get-Location
}
if (-not (Test-Path (Join-Path $ProjectRoot "docker-compose.prod.yml"))) {
    $ProjectRoot = Get-Location
}
Set-Location $ProjectRoot

Write-Host "`nDemarrage iahome + apprendre-autrement..." -ForegroundColor Cyan
$result = docker compose -f docker-compose.prod.yml up -d iahome-app apprendre-autrement 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] iahome - http://localhost:3000" -ForegroundColor Green
    Write-Host "[OK] apprendre-autrement (port 9001 uniquement sur le reseau Docker, pas sur l'hote)" -ForegroundColor Green
    Write-Host "     Logs: docker logs -f iahome-app | docker logs -f apprendre-autrement" -ForegroundColor Gray
} else {
    Write-Host "[X] Erreur: $result" -ForegroundColor Red
    Write-Host "    Si l'image n'existe pas, lancez d'abord: .\scripts\redeploy-prod-full.ps1" -ForegroundColor Yellow
}
Write-Host ""
