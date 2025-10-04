# force-rebuild-production.ps1
# Script pour forcer la reconstruction et le redéploiement en production

Write-Host "🚀 Reconstruction forcée pour la production"
Write-Host "==========================================="
Write-Host ""

# 1. Nettoyer les caches
Write-Host "1. Nettoyage des caches..."
try {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache .next supprimé"
} catch {
    Write-Host "   ⚠️  Erreur suppression .next: $($_.Exception.Message)"
}

try {
    Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache node_modules supprimé"
} catch {
    Write-Host "   ⚠️  Erreur suppression cache node_modules: $($_.Exception.Message)"
}
Write-Host ""

# 2. Reconstruire l'application
Write-Host "2. Reconstruction de l'application..."
try {
    npm run build
    Write-Host "   ✅ Application reconstruite avec succès"
} catch {
    Write-Host "   ❌ Erreur lors de la reconstruction: $($_.Exception.Message)"
    exit 1
}
Write-Host ""

# 3. Vérifier la construction
Write-Host "3. Vérification de la construction..."
if (Test-Path ".next/standalone") {
    Write-Host "   ✅ Dossier standalone créé"
} else {
    Write-Host "   ❌ Dossier standalone manquant"
}

if (Test-Path ".next/static") {
    Write-Host "   ✅ Dossier static créé"
} else {
    Write-Host "   ❌ Dossier static manquant"
}
Write-Host ""

# 4. Tester l'application localement
Write-Host "4. Test de l'application localement..."
try {
    $testResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -ErrorAction Stop
    Write-Host "   Status Code: $($testResponse.StatusCode)"
    if ($testResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Application locale fonctionnelle"
    } else {
        Write-Host "   ❌ Application locale non fonctionnelle"
    }
} catch {
    Write-Host "   ❌ Erreur test local: $($_.Exception.Message)"
}
Write-Host ""

# 5. Instructions pour le déploiement
Write-Host "5. Instructions pour le déploiement en production:"
Write-Host "   📋 Actions à effectuer sur le serveur de production:"
Write-Host "   1. Arrêter l'application actuelle"
Write-Host "   2. Supprimer le dossier .next existant"
Write-Host "   3. Copier le nouveau dossier .next"
Write-Host "   4. Redémarrer l'application"
Write-Host "   5. Purger le cache Cloudflare"
Write-Host "   6. Tester l'accès à https://iahome.fr/encours"
Write-Host ""

Write-Host "🎯 Reconstruction terminée !"
Write-Host "   L'application est prête pour le déploiement en production."
Write-Host "   Assurez-vous de suivre les instructions ci-dessus sur le serveur."
