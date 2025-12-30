# Script pour créer le module Générateur de prompts dans Supabase
Write-Host "🔄 Création du module Générateur de prompts..." -ForegroundColor Cyan

$apiUrl = "http://localhost:3000/api/create-prompt-generator-module"

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json" -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "✅ $($response.message)" -ForegroundColor Green
        if ($response.module) {
            Write-Host "   Module ID: $($response.module.id)" -ForegroundColor Gray
            Write-Host "   Titre: $($response.module.title)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Erreur: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de l'appel à l'API:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    
    Write-Host "`n💡 Vérifiez que:" -ForegroundColor Cyan
    Write-Host "   1. Le serveur Next.js est en cours d'exécution (npm run dev)" -ForegroundColor Gray
    Write-Host "   2. Le serveur écoute sur le port 3000" -ForegroundColor Gray
    Write-Host "   3. L'API /api/create-prompt-generator-module existe" -ForegroundColor Gray
}


