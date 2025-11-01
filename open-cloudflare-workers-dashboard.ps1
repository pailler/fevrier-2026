# Script pour ouvrir Cloudflare Workers Dashboard
# Affiche les instructions claires pour créer le Worker

Write-Host "🔧 Configuration Cloudflare Workers" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Ouvrir Cloudflare Dashboard
Write-Host "🌐 Ouverture du Cloudflare Dashboard..." -ForegroundColor Yellow
Start-Process "https://dash.cloudflare.com/"

Write-Host ""
Write-Host "⏳ Attendre 5 secondes pour que le navigateur s'ouvre..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "📋 Instructions pas à pas:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Sélectionnez votre domaine: iahome.fr" -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "2️⃣  Dans le menu de gauche, cliquez sur: Workers & Pages" -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "3️⃣  Cliquez sur: Create → Worker" -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "4️⃣  Nommez le Worker:" -ForegroundColor Yellow
Write-Host "   protect-librespeed" -ForegroundColor White
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "5️⃣  Dans l'éditeur de code, REMPLACEZ tout le code par défaut par:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   ┌─────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "   │ Ouvrez le fichier: cloudflare-worker-librespeed.js│" -ForegroundColor Cyan
Write-Host "   │ Copiez TOUT le code du fichier                   │" -ForegroundColor Cyan
Write-Host "   │ Collez-le dans l'éditeur Cloudflare              │" -ForegroundColor Cyan
Write-Host "   └─────────────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""
Start-Sleep -Seconds 3

Write-Host "6️⃣  Cliquez sur: Deploy (en haut à droite)" -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "7️⃣  Configurez les Routes:" -ForegroundColor Yellow
Write-Host "   - Dans la page du Worker, cliquez sur: Triggers" -ForegroundColor White
Write-Host "   - Dans 'Routes', cliquez sur: Add route" -ForegroundColor White
Write-Host "   - Route: librespeed.iahome.fr/*" -ForegroundColor White
Write-Host "   - Zone: iahome.fr" -ForegroundColor White
Write-Host "   - Cliquez sur: Add route" -ForegroundColor White
Write-Host ""

Write-Host "✅ Configuration terminée!" -ForegroundColor Green
Write-Host ""

# Vérification de la configuration locale
Write-Host "🔍 Vérification de la configuration locale..." -ForegroundColor Cyan
Write-Host ""

$configFile = "cloudflare-active-config.yml"
$workerFile = "cloudflare-worker-librespeed.js"

if (Test-Path $workerFile) {
    Write-Host "✅ Fichier Worker trouvé: $workerFile" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Fichier Worker non trouvé: $workerFile" -ForegroundColor Yellow
}

if (Test-Path $configFile) {
    $config = Get-Content $configFile -Raw
    
    if ($config -match "librespeed\.iahome\.fr[\s\S]*?localhost:8085") {
        Write-Host "✅ Configuration Tunnel correcte: pointe vers port 8085" -ForegroundColor Green
    }
    elseif ($config -match "librespeed\.iahome\.fr[\s\S]*?localhost:3000") {
        Write-Host "⚠️  Configuration à modifier: pointe vers port 3000" -ForegroundColor Yellow
        Write-Host "   Pour Workers, il faut pointer vers port 8085 directement" -ForegroundColor Gray
    }
}

Write-Host ""

Write-Host "🧪 Pour tester après configuration:" -ForegroundColor Cyan
Write-Host "   .\test-cloudflare-worker.ps1" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Pour plus de détails:" -ForegroundColor Cyan
Write-Host "   GUIDE_CLOUDFLARE_WORKERS.md" -ForegroundColor Gray
Write-Host ""


