# Script de gestion des services essentiels
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status", "logs")]
    [string]$Action
)

Write-Host "🔧 Gestion des Services Essentiels" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

switch ($Action) {
    "start" {
        Write-Host "`n🚀 Démarrage des services essentiels..." -ForegroundColor Green
        .\start-librespeed.ps1
    }
    "stop" {
        Write-Host "`n🛑 Arrêt des services essentiels..." -ForegroundColor Red
        .\stop-librespeed.ps1
    }
    "restart" {
        Write-Host "`n🔄 Redémarrage des services essentiels..." -ForegroundColor Magenta
        .\restart-librespeed.ps1
    }
    "status" {
        Write-Host "`n📊 Statut des services essentiels..." -ForegroundColor Yellow
        docker ps --filter name=librespeed --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    }
    "logs" {
        Write-Host "`n📋 Logs des services essentiels..." -ForegroundColor Blue
        docker-compose logs -f
    }
}

Write-Host "`n✅ Action '$Action' terminée !" -ForegroundColor Green






