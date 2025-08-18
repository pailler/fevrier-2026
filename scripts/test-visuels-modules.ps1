# Script de test pour verifier les nouveaux visuels des modules
Write-Host "Test des nouveaux visuels des modules..." -ForegroundColor Cyan

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

# Test des nouveaux visuels SVG
Write-Host "`nTest des nouveaux visuels SVG:" -ForegroundColor Cyan

$baseUrl = "https://iahome.fr"
$visuels = @(
    @{Url = "$baseUrl/images/module-visuals/chatgpt-module.svg"; Description = "Visuel ChatGPT"}
    @{Url = "$baseUrl/images/module-visuals/stable-diffusion-module.svg"; Description = "Visuel Stable Diffusion"}
    @{Url = "$baseUrl/images/module-visuals/iaphoto-module.svg"; Description = "Visuel IA Photo"}
    @{Url = "$baseUrl/images/module-visuals/iatube-module.svg"; Description = "Visuel IA Tube"}
    @{Url = "$baseUrl/images/module-visuals/pdf-module.svg"; Description = "Visuel PDF"}
    @{Url = "$baseUrl/images/module-visuals/psitransfer-module.svg"; Description = "Visuel PsiTransfer"}
    @{Url = "$baseUrl/images/module-visuals/generic-module.svg"; Description = "Visuel Generique"}
)

$successCount = 0
foreach ($visuel in $visuels) {
    if (Test-ImageUrl -Url $visuel.Url -Description $visuel.Description) {
        $successCount++
    }
}

Write-Host "`nResume des tests:" -ForegroundColor Cyan
Write-Host "Visuels SVG testes: $($visuels.Count)" -ForegroundColor White
Write-Host "Visuels SVG reussis: $successCount" -ForegroundColor Green
Write-Host "Visuels SVG echoues: $($visuels.Count - $successCount)" -ForegroundColor Red

if ($successCount -eq $visuels.Count) {
    Write-Host "`n🎉 Tous les nouveaux visuels sont correctement charges!" -ForegroundColor Green
    Write-Host "Les modules de la page d'accueil utilisent maintenant des visuels stylés inspires du style Bubble" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️ Certains visuels ne sont pas accessibles" -ForegroundColor Yellow
    Write-Host "Verifiez que les fichiers SVG sont bien copies dans le dossier public/images/module-visuals/" -ForegroundColor White
}

Write-Host "`nPour voir les nouveaux visuels:" -ForegroundColor Cyan
Write-Host "1. Ouvrez https://iahome.fr dans votre navigateur" -ForegroundColor White
Write-Host "2. Les modules affichent maintenant des visuels stylés avec des gradients et des interfaces modernes" -ForegroundColor White
Write-Host "3. Chaque module a son propre design unique inspire du style Bubble" -ForegroundColor White





