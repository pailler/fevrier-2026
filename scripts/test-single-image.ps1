# Script pour tester une image specifique
Write-Host "Test d'une image specifique..." -ForegroundColor Cyan

# Test de l'image ChatGPT
$imageUrl = "https://iahome.fr/images/light-modules/chatgpt-light.svg"

try {
    $response = Invoke-WebRequest -Uri $imageUrl -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Image accessible" -ForegroundColor Green
        Write-Host "Taille: $($response.Content.Length) bytes" -ForegroundColor White
        Write-Host "Type: $($response.Headers.'Content-Type')" -ForegroundColor White
        
        # Afficher les premiers caractères du contenu
        $content = $response.Content
        if ($content.Length -gt 100) {
            Write-Host "Contenu (premiers 100 caracteres):" -ForegroundColor Yellow
            Write-Host $content.Substring(0, 100) -ForegroundColor Gray
        } else {
            Write-Host "Contenu complet:" -ForegroundColor Yellow
            Write-Host $content -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ Image accessible mais status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de la page d'accueil:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Page d'accueil accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Page d'accueil (Status: $($response.StatusCode))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Page d'accueil inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}





