# Script pour creer le module Services de l'Administration dans Supabase
# Usage: .\scripts\create-administration-module.ps1

$apiUrl = "http://localhost:3000/api/create-administration-module"

Write-Host "Creation du module Services de l'Administration..." -ForegroundColor Cyan
Write-Host "URL: $apiUrl" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json" -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "Succes: $($response.message)" -ForegroundColor Green
        if ($response.module) {
            Write-Host "Module cree: $($response.module.id)" -ForegroundColor Green
        }
        if ($response.moduleId) {
            Write-Host "Module ID: $($response.moduleId)" -ForegroundColor Green
        }
    } else {
        Write-Host "Erreur: $($response.error)" -ForegroundColor Red
        if ($response.details) {
            Write-Host "Details: $($response.details)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Erreur de requete: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Code de statut: $statusCode" -ForegroundColor Yellow
        
        if ($statusCode -eq 404) {
            Write-Host "L'endpoint n'existe pas. Assurez-vous que:" -ForegroundColor Yellow
            Write-Host "   1. Le serveur Next.js est en cours d'execution (npm run dev)" -ForegroundColor Yellow
            Write-Host "   2. L'API route existe dans src/app/api/create-administration-module/route.ts" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Assurez-vous que le serveur Next.js est en cours d'execution." -ForegroundColor Yellow
        Write-Host "   Vous pouvez demarrer le serveur avec: npm run dev" -ForegroundColor Yellow
    }
}

