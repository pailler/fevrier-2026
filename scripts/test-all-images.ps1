# Script de test complet pour toutes les images
Write-Host "Test complet de toutes les images..." -ForegroundColor Cyan

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

# Test de l'API Health
Write-Host "`nTest de l'API Health:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API Health accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ API Health (Status: $($response.StatusCode))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ API Health inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de toutes les images
Write-Host "`nTest de toutes les images:" -ForegroundColor Cyan

$baseUrl = "https://iahome.fr"
$images = @(
    @{Url = "$baseUrl/images/chatgpt.jpg"; Description = "ChatGPT Image"}
    @{Url = "$baseUrl/images/stablediffusion.jpg"; Description = "Stable Diffusion Image"}
    @{Url = "$baseUrl/images/iaphoto.jpg"; Description = "IA Photo Image"}
    @{Url = "$baseUrl/images/iatube.jpg"; Description = "IA Tube Image"}
    @{Url = "$baseUrl/images/pdf-plus.jpg"; Description = "PDF+ Image"}
    @{Url = "$baseUrl/images/psitransfer.jpg"; Description = "PsiTransfer Image"}
    @{Url = "$baseUrl/images/canvas-framework.jpg"; Description = "Canvas Framework Image"}
    @{Url = "$baseUrl/images/iametube-interface.jpg"; Description = "IA Metube Interface Image"}
)

$successCount = 0
foreach ($image in $images) {
    if (Test-ImageUrl -Url $image.Url -Description $image.Description) {
        $successCount++
    }
}

Write-Host "`nResume des tests:" -ForegroundColor Cyan
Write-Host "Images testees: $($images.Count)" -ForegroundColor White
Write-Host "Images reussies: $successCount" -ForegroundColor Green
Write-Host "Images echouees: $($images.Count - $successCount)" -ForegroundColor Red

if ($successCount -eq $images.Count) {
    Write-Host "`n🎉 Toutes les images sont correctement chargees!" -ForegroundColor Green
    Write-Host "L'application IAHOME est pleinement operationnelle" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️ Certaines images ne sont pas accessibles" -ForegroundColor Yellow
    Write-Host "Verifiez que tous les fichiers JPG sont bien presents dans le dossier public/images/" -ForegroundColor White
}

Write-Host "`nStatut de l'application:" -ForegroundColor Cyan
Write-Host "URL: https://iahome.fr" -ForegroundColor White
Write-Host "Mode: Production" -ForegroundColor White
Write-Host "Domaine: iahome.fr" -ForegroundColor White
Write-Host "Images: $successCount/$($images.Count) fonctionnelles" -ForegroundColor White





