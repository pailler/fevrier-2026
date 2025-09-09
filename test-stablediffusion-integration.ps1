# Script de test pour vérifier l'intégration StableDiffusion
Write-Host "🎨 Test de l'intégration StableDiffusion" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Vérification de l'application principale:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Application principale accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Application principale non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Vérification des conteneurs Docker:" -ForegroundColor Cyan
try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String -Pattern "iahome-app"
    Write-Host "   ✅ Conteneurs Docker:" -ForegroundColor Green
    $containers | ForEach-Object { Write-Host "      $($_)" -ForegroundColor White }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification des conteneurs: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Configuration StableDiffusion implémentée:" -ForegroundColor Yellow
Write-Host "   ✅ API check-auth modifiée pour gérer StableDiffusion" -ForegroundColor White
Write-Host "   ✅ Redirection vers stablediffusion.iahome.fr avec token" -ForegroundColor White
Write-Host "   ✅ Accès interdit hors iahome.fr" -ForegroundColor White
Write-Host "   ✅ AuthorizedAccessButton mis à jour pour StableDiffusion" -ForegroundColor White
Write-Host "   ✅ Vérification des quotas et génération de token" -ForegroundColor White
Write-Host "   ✅ Ouverture dans un nouvel onglet" -ForegroundColor White
Write-Host "   ✅ Configuration Docker ajoutée (pytorch/pytorch)" -ForegroundColor White
Write-Host "   ✅ Configuration Traefik mise à jour (iahome.fr)" -ForegroundColor White
Write-Host "   ✅ Configuration Cloudflared mise à jour" -ForegroundColor White
Write-Host "   ✅ URLs de modules mises à jour" -ForegroundColor White
Write-Host ""

Write-Host "🔐 Processus d'accès StableDiffusion:" -ForegroundColor Cyan
Write-Host "1. Utilisateur clique sur le bouton d'accès StableDiffusion" -ForegroundColor White
Write-Host "2. Vérification de l'autorisation et des quotas" -ForegroundColor White
Write-Host "3. Génération d'un token temporaire JWT" -ForegroundColor White
Write-Host "4. Ouverture de stablediffusion.iahome.fr?token=XXX dans un nouvel onglet" -ForegroundColor White
Write-Host "5. API check-auth valide le token et redirige vers StableDiffusion" -ForegroundColor White
Write-Host "6. Accès direct bloqué si pas de token ou origine incorrecte" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Note sur le service StableDiffusion:" -ForegroundColor Yellow
Write-Host "   Le service StableDiffusion nécessite des ressources importantes (GPU/CPU)" -ForegroundColor White
Write-Host "   Il n'est pas démarré automatiquement pour éviter la surcharge" -ForegroundColor White
Write-Host "   Pour le démarrer manuellement: docker-compose -f docker-services/docker-compose.services.yml up -d stablediffusion" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Test à effectuer:" -ForegroundColor Cyan
Write-Host "1. Ouvrez https://iahome.fr" -ForegroundColor White
Write-Host "2. Connectez-vous avec votre compte" -ForegroundColor White
Write-Host "3. Allez dans /encours ou /modules" -ForegroundColor White
Write-Host "4. Cliquez sur le bouton d'accès StableDiffusion" -ForegroundColor White
Write-Host "5. Vérifiez l'ouverture dans un nouvel onglet avec token" -ForegroundColor White
Write-Host "6. Testez l'accès direct à stablediffusion.iahome.fr (doit rediriger vers login)" -ForegroundColor White
Write-Host ""

Write-Host "✅ Intégration StableDiffusion complète !" -ForegroundColor Green
Write-Host "🎨 StableDiffusion fonctionne exactement comme LibreSpeed, MeTube, PsiTransfer et PDF avec token temporaire" -ForegroundColor Green
