Write-Host "Diagnostic du service Stirling-PDF..." -ForegroundColor Green

try {
    # Verifier si le container existe
    Write-Host "`nVerification du container..." -ForegroundColor Yellow
    $containerExists = docker ps -a --filter "name=stirling-pdf" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    if ($containerExists -match "stirling-pdf") {
        Write-Host "  ✅ Container stirling-pdf trouve" -ForegroundColor Green
        Write-Host "  Status: $containerExists" -ForegroundColor Cyan
    } else {
        Write-Host "  ❌ Container stirling-pdf non trouve" -ForegroundColor Red
        Write-Host "  Le service n'est pas demarre" -ForegroundColor Yellow
        return
    }
    
    # Verifier le statut du container
    Write-Host "`nStatut du container..." -ForegroundColor Yellow
    $containerStatus = docker inspect stirling-pdf --format "{{.State.Status}}"
    
    if ($containerStatus -eq "running") {
        Write-Host "  ✅ Container en cours d'execution" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Container non en cours d'execution (Status: $containerStatus)" -ForegroundColor Red
    }
    
    # Verifier les ports
    Write-Host "`nVerification des ports..." -ForegroundColor Yellow
    $portMapping = docker port stirling-pdf
    if ($portMapping) {
        Write-Host "  ✅ Ports mappes: $portMapping" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Aucun port mappe" -ForegroundColor Red
    }
    
    # Verifier les logs
    Write-Host "`nLogs du service (derniers 20 lignes)..." -ForegroundColor Yellow
    docker logs stirling-pdf --tail=20
    
    # Verifier les ressources
    Write-Host "`nUtilisation des ressources..." -ForegroundColor Yellow
    $stats = docker stats stirling-pdf --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    Write-Host $stats -ForegroundColor Cyan
    
    # Tester l'acces au service
    Write-Host "`nTest d'acces au service..." -ForegroundColor Yellow
    
    # Test local
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Service accessible localement sur http://localhost:8081" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Service accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Service non accessible localement: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test de l'endpoint de sante
    try {
        $healthResponse = Invoke-WebRequest -Uri "http://localhost:8081/actuator/health" -UseBasicParsing -TimeoutSec 10
        if ($healthResponse.StatusCode -eq 200) {
            Write-Host "  ✅ Endpoint de sante accessible" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Endpoint de sante accessible mais statut: $($healthResponse.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Endpoint de sante non accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Verifier les volumes
    Write-Host "`nVerification des volumes..." -ForegroundColor Yellow
    $volumes = docker inspect stirling-pdf --format "{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}"
    if ($volumes) {
        Write-Host "  Volumes montes:" -ForegroundColor Green
        Write-Host $volumes -ForegroundColor Cyan
    } else {
        Write-Host "  ⚠️ Aucun volume monte" -ForegroundColor Yellow
    }
    
    # Verifier les variables d'environnement
    Write-Host "`nVariables d'environnement..." -ForegroundColor Yellow
    $envVars = docker inspect stirling-pdf --format "{{range .Config.Env}}{{.}}{{println}}{{end}}"
    Write-Host $envVars -ForegroundColor Cyan
    
} catch {
    Write-Host "Erreur lors du diagnostic: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nSolutions courantes:" -ForegroundColor Yellow
Write-Host "1. Si le service ne demarre pas: docker-compose -f docker-compose.prod.yml up -d stirling-pdf" -ForegroundColor White
Write-Host "2. Si le port est occupe: changer le port dans docker-compose.prod.yml" -ForegroundColor White
Write-Host "3. Si les volumes posent probleme: supprimer et recreer les dossiers" -ForegroundColor White
Write-Host "4. Si le service ne repond pas: redemarrer avec docker restart stirling-pdf" -ForegroundColor White

Write-Host "`nDiagnostic termine!" -ForegroundColor Green
