Write-Host "🔄 FORCE REBUILD AND RESTART - iahome.fr"
Write-Host "========================================="
Write-Host ""

# 1. Arrêter tous les processus Node.js
Write-Host "1. Arrêt de tous les processus Node.js..."
taskkill /F /IM node.exe 2>nul
Start-Sleep -Seconds 2
Write-Host "✅ Processus Node.js arrêtés"
Write-Host ""

# 2. Nettoyer les caches
Write-Host "2. Nettoyage des caches..."
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Caches nettoyés"
Write-Host ""

# 3. Reconstruire l'application
Write-Host "3. Reconstruction de l'application..."
npm run build
Write-Host ""

# 4. Redémarrer l'application
Write-Host "4. Redémarrage de l'application..."
npm run start
Write-Host ""

Write-Host "✅ Reconstruction et redémarrage terminés !"
Write-Host "🌐 L'application est maintenant accessible sur http://localhost:3000"
Write-Host "🔗 Testez les pages :"
Write-Host "   • http://localhost:3000/about"
Write-Host "   • http://localhost:3000/pricing"
Write-Host "   • http://localhost:3000/terms"
Write-Host "   • http://localhost:3000/privacy"
Write-Host "   • http://localhost:3000/cookies"
Write-Host ""
Write-Host "💡 Les changements de header (SimpleHeader) sont maintenant actifs !"


