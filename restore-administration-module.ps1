# Script pour restaurer le module Services de l'Administration
# Usage: .\restore-administration-module.ps1

$apiUrl = "http://localhost:3000/api/create-administration-module"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RESTAURATION DU MODULE SERVICES DE L'ADMINISTRATION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verification que le serveur Next.js est demarre..." -ForegroundColor Yellow

# Verifier si le serveur est demarre
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "   OK: Serveur Next.js actif" -ForegroundColor Green
} catch {
    Write-Host "   ATTENTION: Serveur Next.js non accessible" -ForegroundColor Yellow
    Write-Host "   Demarrez le serveur avec: npm run dev" -ForegroundColor White
    Write-Host "   Puis relancez ce script" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "Creation du module dans Supabase..." -ForegroundColor Yellow
Write-Host "   URL API: $apiUrl" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json" -ErrorAction Stop
    
    if ($response.success) {
        Write-Host ""
        Write-Host "SUCCES: $($response.message)" -ForegroundColor Green
        if ($response.module) {
            Write-Host "   Module ID: $($response.module.id)" -ForegroundColor Gray
            Write-Host "   Titre: $($response.module.title)" -ForegroundColor Gray
            Write-Host "   Categorie: $($response.module.category)" -ForegroundColor Gray
            Write-Host "   Prix: $($response.module.price) tokens" -ForegroundColor Gray
        }
        if ($response.moduleId) {
            Write-Host "   Module ID: $($response.moduleId)" -ForegroundColor Gray
        }
        Write-Host ""
        Write-Host "Le module est maintenant disponible dans:" -ForegroundColor Cyan
        Write-Host "   - Page essentiels: /essentiels" -ForegroundColor Gray
        Write-Host "   - Page encours: /encours" -ForegroundColor Gray
        Write-Host "   - Page detail: /card/administration" -ForegroundColor Gray
        Write-Host "   - Page principale: /administration" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "ERREUR: $($response.error)" -ForegroundColor Red
        if ($response.details) {
            Write-Host "   Details: $($response.details)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host ""
    Write-Host "ERREUR de requete: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Code de statut: $statusCode" -ForegroundColor Yellow
        
        if ($statusCode -eq 404) {
            Write-Host ""
            Write-Host "L'endpoint n'existe pas. Verifiez que:" -ForegroundColor Yellow
            Write-Host "   1. Le serveur Next.js est en cours d'execution (npm run dev)" -ForegroundColor White
            Write-Host "   2. L'API route existe dans src/app/api/create-administration-module/route.ts" -ForegroundColor White
        } elseif ($statusCode -eq 500) {
            Write-Host ""
            Write-Host "Erreur serveur. Verifiez:" -ForegroundColor Yellow
            Write-Host "   1. Les variables d'environnement Supabase sont configurees" -ForegroundColor White
            Write-Host "   2. La connexion a Supabase fonctionne" -ForegroundColor White
        }
    } else {
        Write-Host ""
        Write-Host "Assurez-vous que le serveur Next.js est en cours d'execution." -ForegroundColor Yellow
        Write-Host "   Vous pouvez demarrer le serveur avec: npm run dev" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

