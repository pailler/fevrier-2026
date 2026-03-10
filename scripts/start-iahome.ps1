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

Write-Host "`nDemarrage iahome..." -ForegroundColor Cyan
$result = docker-compose -f docker-compose.prod.yml up -d iahome-app 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] iahome demarre - http://localhost:3000" -ForegroundColor Green
    Write-Host "     Logs: docker logs -f iahome-app" -ForegroundColor Gray
} else {
    Write-Host "[X] Erreur: $result" -ForegroundColor Red
    Write-Host "    Si l'image n'existe pas, lancez d'abord: .\scripts\redeploy-prod-full.ps1" -ForegroundColor Yellow
}
Write-Host ""
