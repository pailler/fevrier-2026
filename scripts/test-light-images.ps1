# Script de test pour verifier les nouvelles images legeres
Write-Host "Test des nouvelles images legeres..." -ForegroundColor Cyan

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

# Test des nouvelles images legeres
Write-Host "`nTest des nouvelles images legeres:" -ForegroundColor Cyan

$baseUrl = "https://iahome.fr"
$images = @(
    @{Url = "$baseUrl/images/light-modules/chatgpt-light.svg"; Description = "ChatGPT Light"}
    @{Url = "$baseUrl/images/light-modules/stable-diffusion-light.svg"; Description = "Stable Diffusion Light"}
    @{Url = "$baseUrl/images/light-modules/iaphoto-light.svg"; Description = "IA Photo Light"}
    @{Url = "$baseUrl/images/light-modules/iatube-light.svg"; Description = "IA Tube Light"}
    @{Url = "$baseUrl/images/light-modules/pdf-light.svg"; Description = "PDF Light"}
    @{Url = "$baseUrl/images/light-modules/psitransfer-light.svg"; Description = "PsiTransfer Light"}
    @{Url = "$baseUrl/images/light-modules/metube-light.svg"; Description = "Metube Light"}
    @{Url = "$baseUrl/images/light-modules/librespeed-light.svg"; Description = "Librespeed Light"}
    @{Url = "$baseUrl/images/light-modules/generic-light.svg"; Description = "Generic Light"}
)

$successCount = 0
foreach ($image in $images) {
    if (Test-ImageUrl -Url $image.Url -Description $image.Description) {
        $successCount++
    }
}

Write-Host "`nResume des tests:" -ForegroundColor Cyan
Write-Host "Images legeres testees: $($images.Count)" -ForegroundColor White
Write-Host "Images legeres reussies: $successCount" -ForegroundColor Green
Write-Host "Images legeres echouees: $($images.Count - $successCount)" -ForegroundColor Red

if ($successCount -eq $images.Count) {
    Write-Host "`n🎉 Toutes les nouvelles images legeres sont correctement chargees!" -ForegroundColor Green
    Write-Host "Les modules de la page d'accueil utilisent maintenant des images legères et rapides" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️ Certaines images ne sont pas accessibles" -ForegroundColor Yellow
    Write-Host "Verifiez que les fichiers SVG sont bien copies dans le dossier public/images/light-modules/" -ForegroundColor White
}

Write-Host "`nPour voir les nouvelles images:" -ForegroundColor Cyan
Write-Host "1. Ouvrez https://iahome.fr dans votre navigateur" -ForegroundColor White
Write-Host "2. Les modules affichent maintenant des images legeres avec des icones et gradients" -ForegroundColor White
Write-Host "3. Chaque module a son propre design unique et coloré" -ForegroundColor White





