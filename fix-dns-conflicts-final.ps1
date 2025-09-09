# Script pour résoudre définitivement les conflits DNS Cloudflare
# Suppression des enregistrements A conflictuels

Write-Host "🔧 Résolution des conflits DNS Cloudflare - VERSION FINALE" -ForegroundColor Red

Write-Host "`n⚠️  PROBLÈME IDENTIFIÉ:" -ForegroundColor Yellow
Write-Host "Des enregistrements A existent encore et empêchent la création des CNAME pour le tunnel" -ForegroundColor Red

Write-Host "`n📋 INSTRUCTIONS POUR RÉSOUDRE DÉFINITIVEMENT:" -ForegroundColor Cyan

Write-Host "`n1. Aller sur Cloudflare DNS: https://dash.cloudflare.com" -ForegroundColor White
Write-Host "2. Sélectionner le domaine iahome.fr" -ForegroundColor White
Write-Host "3. Aller dans l'onglet 'DNS' > 'Records'" -ForegroundColor White

Write-Host "`n4. SUPPRIMER TOUS ces enregistrements A (ils seront remplacés par des CNAME):" -ForegroundColor Red

Write-Host "`n   📍 ENREGISTREMENTS À SUPPRIMER:" -ForegroundColor Yellow
Write-Host "   ❌ api.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Red
Write-Host "   ❌ metube.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Red
Write-Host "   ❌ pdf.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Red
Write-Host "   ❌ psitransfer.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Red
Write-Host "   ❌ qrcodes.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Red
Write-Host "   ❌ stablediffusion.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Red
Write-Host "   ❌ test.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Red

Write-Host "`n   📍 ENREGISTREMENTS À GARDER (déjà corrects):" -ForegroundColor Green
Write-Host "   ✅ iahome.fr (CNAME -> b19084f4-e2d6-47f5-81c3-0...)" -ForegroundColor Green
Write-Host "   ✅ librespeed.iahome.fr (CNAME -> b19084f4-e2d6-47f5-81c3-0...)" -ForegroundColor Green
Write-Host "   ✅ Tous les enregistrements MX, NS, TXT" -ForegroundColor Green

Write-Host "`n5. Une fois TOUS les enregistrements A supprimés, revenir ici" -ForegroundColor Cyan
Write-Host "6. Appuyer sur Entrée pour continuer avec la configuration du tunnel" -ForegroundColor Cyan

Read-Host

Write-Host "`n🌐 Configuration des routes DNS pour le tunnel..." -ForegroundColor Yellow

$domains = @(
    "pdf.iahome.fr",
    "metube.iahome.fr", 
    "psitransfer.iahome.fr",
    "qrcodes.iahome.fr",
    "api.iahome.fr",
    "stablediffusion.iahome.fr",
    "test.iahome.fr"
)

foreach ($domain in $domains) {
    Write-Host "📡 Configuration de $domain..." -ForegroundColor Cyan
    try {
        cloudflared tunnel route dns iahome-tunnel $domain
        Write-Host "✅ $domain configuré avec succès" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors de la configuration de $domain" -ForegroundColor Red
        Write-Host "   Vérifiez que l'enregistrement A a été supprimé dans Cloudflare" -ForegroundColor Yellow
    }
}

Write-Host "`n🎯 Configuration des règles d'ingress dans Cloudflare Dashboard:" -ForegroundColor Yellow
Write-Host "1. Aller sur: https://dash.cloudflare.com" -ForegroundColor White
Write-Host "2. Zero Trust > Access > Tunnels" -ForegroundColor White
Write-Host "3. Sélectionner tunnel 'iahome-tunnel'" -ForegroundColor White
Write-Host "4. Configurer les règles d'ingress:" -ForegroundColor White

Write-Host "`n   RÈGLES D'INGRESS À CONFIGURER:" -ForegroundColor Cyan
Write-Host "   pdf.iahome.fr → http://192.168.1.150:8081" -ForegroundColor White
Write-Host "   metube.iahome.fr → http://192.168.1.150:8082" -ForegroundColor White
Write-Host "   psitransfer.iahome.fr → http://192.168.1.150:8084" -ForegroundColor White
Write-Host "   qrcodes.iahome.fr → http://192.168.1.150:8086" -ForegroundColor White
Write-Host "   api.iahome.fr → http://192.168.1.150:3000" -ForegroundColor White
Write-Host "   stablediffusion.iahome.fr → http://192.168.1.150:8085" -ForegroundColor White
Write-Host "   test.iahome.fr → http://192.168.1.150:3000" -ForegroundColor White

Write-Host "`n✅ Configuration terminée !" -ForegroundColor Green
Write-Host "Tous les services seront accessibles via HTTPS après configuration des règles d'ingress" -ForegroundColor Cyan
