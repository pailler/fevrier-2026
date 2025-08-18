# Script pour tester les images existantes
Write-Host "Test des images existantes..." -ForegroundColor Cyan

# Verifier que nous sommes dans le bon repertoire
if (-not (Test-Path "package.json")) {
    Write-Host "Erreur: Ce script doit etre execute depuis le repertoire racine du projet" -ForegroundColor Red
    exit 1
}

# Fonction pour tester une URL d'image
function Test-ImageUrl {
    param($Url, $Description)
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Description" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️ $Description (Status: $($response.StatusCode))" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ $Description : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test de la page d'accueil
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

# Test des images existantes
Write-Host "`nTest des images existantes:" -ForegroundColor Cyan

$baseUrl = "https://iahome.fr"
$images = @(
    @{Url = "$baseUrl/images/chatgpt.jpg"; Description = "ChatGPT Image"}
    @{Url = "$baseUrl/images/stablediffusion.jpg"; Description = "Stable Diffusion Image"}
    @{Url = "$baseUrl/images/iaphoto.jpg"; Description = "IA Photo Image"}
    @{Url = "$baseUrl/images/iatube.jpg"; Description = "IA Tube Image"}
    @{Url = "$baseUrl/images/pdf-plus.jpg"; Description = "PDF+ Image"}
    @{Url = "$baseUrl/images/psitransfer.jpg"; Description = "PsiTransfer Image"}
)

$successCount = 0
foreach ($image in $images) {
    if (Test-ImageUrl -Url $image.Url -Description $image.Description) {
        $successCount++
    }
}

Write-Host "`nResume des tests:" -ForegroundColor Cyan
Write-Host "Images existantes testees: $($images.Count)" -ForegroundColor White
Write-Host "Images existantes reussies: $successCount" -ForegroundColor Green
Write-Host "Images existantes echouees: $($images.Count - $successCount)" -ForegroundColor Red

if ($successCount -eq $images.Count) {
    Write-Host "`n🎉 Toutes les images existantes sont correctement chargees!" -ForegroundColor Green
    Write-Host "Les modules de la page d'accueil utilisent maintenant les images existantes" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️ Certaines images ne sont pas accessibles" -ForegroundColor Yellow
    Write-Host "Verifiez que les fichiers JPG sont bien presents dans le dossier public/images/" -ForegroundColor White
}

Write-Host "`nPour voir les images:" -ForegroundColor Cyan
Write-Host "1. Ouvrez https://iahome.fr dans votre navigateur" -ForegroundColor White
Write-Host "2. Les modules affichent maintenant les images existantes" -ForegroundColor White
Write-Host "3. Plus de zones noires!" -ForegroundColor White





