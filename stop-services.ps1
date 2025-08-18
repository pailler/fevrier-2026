Write-Host "Arret des services Docker externes..." -ForegroundColor Green

try {
    # Arreter tous les services
    Write-Host "`nArret des services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.services.yml down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Services arretes avec succes!" -ForegroundColor Green
        
        # Verifier que les conteneurs sont bien arretes
        Write-Host "`nVerification de l'arret des conteneurs..." -ForegroundColor Yellow
        $containers = @("stirling-pdf", "metube", "librespeed", "psitransfer", "portainer")
        
        foreach ($container in $containers) {
            $status = docker ps -a --filter "name=$container" --format "{{.Status}}"
            if ($status -match "Up") {
                Write-Host "  ⚠️ $container encore en cours d'execution" -ForegroundColor Yellow
            } else {
                Write-Host "  ✅ $container arrete" -ForegroundColor Green
            }
        }
        
    } else {
        Write-Host "Erreur lors de l'arret des services" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nArret termine!" -ForegroundColor Green
