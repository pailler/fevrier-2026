# Script pour insérer le module Whisper IA dans la base de données
Write-Host "🔄 Insertion du module Whisper IA..." -ForegroundColor Blue

try {
    # Appeler l'API d'insertion
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/insert-whisper" -Method POST -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ $($response.message)" -ForegroundColor Green
        Write-Host "📊 Données du module:" -ForegroundColor Cyan
        Write-Host "   - ID: $($response.data.id)" -ForegroundColor White
        Write-Host "   - Titre: $($response.data.title)" -ForegroundColor White
        Write-Host "   - Catégorie: $($response.data.category)" -ForegroundColor White
        Write-Host "   - Prix: $($response.data.price)€" -ForegroundColor White
        Write-Host "   - URL: $($response.data.url)" -ForegroundColor White
        Write-Host "   - Image: $($response.data.image_url)" -ForegroundColor White
    } else {
        Write-Host "❌ Erreur: $($response.error)" -ForegroundColor Red
        if ($response.details) {
            Write-Host "   Détails: $($response.details)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Erreur lors de l'appel API: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Assurez-vous que le serveur Next.js est démarré (npm run dev)" -ForegroundColor Yellow
}

Write-Host "`n🎯 Module Whisper IA prêt !" -ForegroundColor Green
Write-Host "   - Carte visible sur /applications" -ForegroundColor White
Write-Host "   - Page détaillée sur /card/whisper" -ForegroundColor White
Write-Host "   - Service accessible sur https://whisper.iahome.fr" -ForegroundColor White
