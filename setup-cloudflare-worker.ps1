# Script pour configurer Cloudflare Worker pour LibreSpeed
# Affiche les instructions et vérifie la configuration

Write-Host "🔧 Configuration Cloudflare Workers pour LibreSpeed" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Instructions pour Cloudflare Dashboard:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1️⃣  Créer le Worker" -ForegroundColor Cyan
Write-Host "   1. Connectez-vous à: https://dash.cloudflare.com/" -ForegroundColor White
Write-Host "   2. Sélectionnez votre domaine: iahome.fr" -ForegroundColor White
Write-Host "   3. Allez dans: Workers & Pages → Workers" -ForegroundColor White
Write-Host "   4. Cliquez sur: Create → Worker" -ForegroundColor White
Write-Host "   5. Nommez-le: protect-librespeed" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  Coller le Code" -ForegroundColor Cyan
Write-Host "   1. Ouvrez le fichier: cloudflare-worker-librespeed.js" -ForegroundColor White
Write-Host "   2. Copiez tout le code" -ForegroundColor White
Write-Host "   3. Collez-le dans l'éditeur Cloudflare (remplacez le code par défaut)" -ForegroundColor White
Write-Host "   4. Cliquez sur: Deploy" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣  Configurer les Routes" -ForegroundColor Cyan
Write-Host "   1. Dans la page du Worker, cliquez sur: Triggers" -ForegroundColor White
Write-Host "   2. Dans la section 'Routes', cliquez sur: Add route" -ForegroundColor White
Write-Host "   3. Route: librespeed.iahome.fr/*" -ForegroundColor White
Write-Host "   4. Zone: iahome.fr" -ForegroundColor White
Write-Host "   5. Cliquez sur: Add route" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣  Configuration Cloudflare Tunnel" -ForegroundColor Cyan
Write-Host ""

# Vérification de la configuration Cloudflare Tunnel
$configFile = "cloudflare-active-config.yml"

if (Test-Path $configFile) {
    $config = Get-Content $configFile -Raw
    
    if ($config -match "librespeed\.iahome\.fr") {
        Write-Host "✅ Fichier de configuration trouvé: $configFile" -ForegroundColor Green
        
        # Vérifier si pointe directement vers LibreSpeed (port 8085)
        if ($config -match "librespeed\.iahome\.fr[\s\S]*?localhost:8085" -or $config -match "librespeed\.iahome\.fr[\s\S]*?127\.0\.0\.1:8085") {
            Write-Host "✅ Configuration correcte: librespeed pointe directement vers LibreSpeed (port 8085)" -ForegroundColor Green
            Write-Host "   Le Worker Cloudflare gère la protection, pas Next.js" -ForegroundColor Gray
        }
        elseif ($config -match "librespeed\.iahome\.fr[\s\S]*?localhost:3000" -or $config -match "librespeed\.iahome\.fr[\s\S]*?127\.0\.0\.1:3000") {
            Write-Host "⚠️  Configuration à modifier: librespeed pointe vers Next.js (port 3000)" -ForegroundColor Yellow
            Write-Host "   Pour Workers, il faut pointer directement vers LibreSpeed (port 8085)" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "   Modification nécessaire dans cloudflare-active-config.yml:" -ForegroundColor Yellow
            Write-Host "   service: http://localhost:8085  # Au lieu de localhost:3000" -ForegroundColor White
        }
        else {
            Write-Host "⚠️  Configuration à vérifier: librespeed ne semble pas pointer vers le bon port" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "⚠️  Configuration librespeed non trouvée dans $configFile" -ForegroundColor Yellow
    }
}
else {
    Write-Host "⚠️  Fichier de configuration non trouvé: $configFile" -ForegroundColor Yellow
}

Write-Host ""

Write-Host "🔄 Pour redémarrer le tunnel Cloudflare:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Arrêter le tunnel" -ForegroundColor Gray
Write-Host "Get-Process -Name `"cloudflared`" -ErrorAction SilentlyContinue | Stop-Process -Force" -ForegroundColor White
Write-Host ""
Write-Host "# Redémarrer avec la nouvelle configuration" -ForegroundColor Gray
Write-Host '$configPath = Resolve-Path "cloudflare-active-config.yml"' -ForegroundColor White
Write-Host 'Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--config", "`"$configPath`"", "run", "iahome-new" -WindowStyle Hidden' -ForegroundColor White
Write-Host ""

Write-Host "🧪 Tests à Effectuer:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Accès direct sans token:" -ForegroundColor Yellow
Write-Host "   https://librespeed.iahome.fr" -ForegroundColor White
Write-Host "   → Doit rediriger vers iahome.fr/encours" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Accès avec token:" -ForegroundColor Yellow
Write-Host "   https://librespeed.iahome.fr?token=VOTRE_TOKEN" -ForegroundColor White
Write-Host "   → Doit charger LibreSpeed normalement" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Ressources statiques:" -ForegroundColor Yellow
Write-Host "   https://librespeed.iahome.fr/style.css" -ForegroundColor White
Write-Host "   → Doit se charger normalement (pas de redirection)" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Pour plus de détails:" -ForegroundColor Cyan
Write-Host "   GUIDE_CLOUDFLARE_WORKERS.md" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host ""

