# Test simple des images JPG
Write-Host "Test simple des images JPG..." -ForegroundColor Cyan

$baseUrl = "https://iahome.fr"
$images = @(
    "chatgpt.jpg",
    "stablediffusion.jpg", 
    "iaphoto.jpg",
    "iatube.jpg",
    "pdf-plus.jpg",
    "psitransfer.jpg"
)

Write-Host "`nTest des images JPG de base:" -ForegroundColor Yellow
$successCount = 0

foreach ($image in $images) {
    $url = "$baseUrl/images/$image"
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $image" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ $image (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $image : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nRésumé:" -ForegroundColor Cyan
Write-Host "Images testées: $($images.Count)" -ForegroundColor White
Write-Host "Images fonctionnelles: $successCount" -ForegroundColor Green

if ($successCount -eq $images.Count) {
    Write-Host "`n🎉 Toutes les images JPG sont accessibles!" -ForegroundColor Green
    Write-Host "L'application devrait maintenant afficher les images au lieu des zones noires" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️ Certaines images ne sont pas accessibles" -ForegroundColor Yellow
}

Write-Host "`nURL de test: https://iahome.fr" -ForegroundColor White





