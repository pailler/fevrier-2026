param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("pdf", "metube", "librespeed", "psitransfer", "portainer", "all")]
    [string]$Service,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status", "logs")]
    [string]$Action
)

Write-Host "Gestion du service $Service - Action: $Action" -ForegroundColor Green

# Mapping des services vers leurs noms de conteneurs
$serviceMapping = @{
    "pdf" = "stirling-pdf"
    "metube" = "metube"
    "librespeed" = "librespeed"
    "psitransfer" = "psitransfer"
    "portainer" = "portainer"
}

try {
    if ($Service -eq "all") {
        # Gestion de tous les services
        switch ($Action) {
            "start" {
                Write-Host "`nDemarrage de tous les services..." -ForegroundColor Yellow
                docker-compose -f docker-compose.services.yml up -d
            }
            "stop" {
                Write-Host "`nArret de tous les services..." -ForegroundColor Yellow
                docker-compose -f docker-compose.services.yml down
            }
            "restart" {
                Write-Host "`nRedemarrage de tous les services..." -ForegroundColor Yellow
                docker-compose -f docker-compose.services.yml restart
            }
            "status" {
                Write-Host "`nStatut de tous les services..." -ForegroundColor Yellow
                docker-compose -f docker-compose.services.yml ps
            }
            "logs" {
                Write-Host "`nLogs de tous les services..." -ForegroundColor Yellow
                docker-compose -f docker-compose.services.yml logs --tail=20
            }
        }
    } else {
        # Gestion d'un service spécifique
        $containerName = $serviceMapping[$Service]
        
        switch ($Action) {
            "start" {
                Write-Host "`nDemarrage du service $Service ($containerName)..." -ForegroundColor Yellow
                docker-compose -f docker-compose.services.yml up -d $containerName
            }
            "stop" {
                Write-Host "`nArret du service $Service ($containerName)..." -ForegroundColor Yellow
                docker-compose -f docker-compose.services.yml stop $containerName
            }
            "restart" {
                Write-Host "`nRedemarrage du service $Service ($containerName)..." -ForegroundColor Yellow
                docker-compose -f docker-compose.services.yml restart $containerName
            }
            "status" {
                Write-Host "`nStatut du service $Service ($containerName)..." -ForegroundColor Yellow
                docker ps --filter "name=$containerName" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
            }
            "logs" {
                Write-Host "`nLogs du service $Service ($containerName)..." -ForegroundColor Yellow
                docker logs $containerName --tail=20
            }
        }
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nAction $Action reussie pour $Service!" -ForegroundColor Green
    } else {
        Write-Host "`nErreur lors de l'action $Action pour $Service" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nGestion termine!" -ForegroundColor Green
