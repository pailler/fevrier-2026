# Script pour vérifier les Redirect Rules et Page Rules Cloudflare
# qui pourraient interférer avec le Cloudflare Worker

Write-Host "🔍 Vérification des règles Cloudflare qui pourraient interférer avec le Worker" -ForegroundColor Cyan
Write-Host ""

# Liste des sous-domaines protégés
$subdomains = @(
    "librespeed.iahome.fr",
    "metube.iahome.fr",
    "pdf.iahome.fr",
    "psitransfer.iahome.fr",
    "qrcodes.iahome.fr"
)

Write-Host "📋 Instructions pour vérifier les règles dans Cloudflare Dashboard" -ForegroundColor Yellow
Write-Host "─" * 80
Write-Host ""

# Instructions pour Redirect Rules
Write-Host "1️⃣  REDIRECT RULES (Rules → Redirect Rules)" -ForegroundColor Cyan
Write-Host "─" * 80
Write-Host ""
Write-Host "   Accédez à:" -ForegroundColor White
Write-Host "   https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/rules/redirect-rules" -ForegroundColor Green
Write-Host ""
Write-Host "   ⚠️  À VÉRIFIER:" -ForegroundColor Yellow
Write-Host "   - Cherchez des règles qui ciblent les sous-domaines suivants:" -ForegroundColor White
foreach ($subdomain in $subdomains) {
    Write-Host "     • $subdomain" -ForegroundColor Gray
}
Write-Host ""
Write-Host "   📌 Points importants:" -ForegroundColor Yellow
Write-Host "   - Les Redirect Rules ont PRIORITÉ sur les Workers" -ForegroundColor Red
Write-Host "   - Vérifiez l'ordre de priorité (les règles plus hautes sont exécutées en premier)" -ForegroundColor White
Write-Host "   - Si une Redirect Rule redirige tous les accès à pdf.iahome.fr, elle aura priorité" -ForegroundColor White
Write-Host ""
Write-Host "   🔧 Si vous trouvez une règle conflictuelle:" -ForegroundColor Yellow
Write-Host "   1. Notez le nom et la priorité de la règle" -ForegroundColor White
Write-Host "   2. Modifiez-la pour exclure les requêtes avec ?token=" -ForegroundColor White
Write-Host "   3. Ou supprimez-la si elle n'est plus nécessaire" -ForegroundColor White
Write-Host "   4. Ou réduisez sa priorité pour que le Worker soit exécuté en premier" -ForegroundColor White
Write-Host ""

# Instructions pour Page Rules
Write-Host "2️⃣  PAGE RULES (Rules → Page Rules)" -ForegroundColor Cyan
Write-Host "─" * 80
Write-Host ""
Write-Host "   Accédez à:" -ForegroundColor White
Write-Host "   https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/rules/page-rules" -ForegroundColor Green
Write-Host ""
Write-Host "   ⚠️  À VÉRIFIER:" -ForegroundColor Yellow
Write-Host "   - Cherchez des règles qui ciblent les sous-domaines suivants:" -ForegroundColor White
foreach ($subdomain in $subdomains) {
    Write-Host "     • $subdomain" -ForegroundColor Gray
}
Write-Host ""
Write-Host "   📌 Points importants:" -ForegroundColor Yellow
Write-Host "   - Les Page Rules peuvent avoir priorité sur les Workers" -ForegroundColor Red
Write-Host "   - Les Page Rules sont limitées (3 gratuites, puis payantes)" -ForegroundColor White
Write-Host "   - Vérifiez si une Page Rule redirige ou modifie les requêtes" -ForegroundColor White
Write-Host ""
Write-Host "   🔧 Si vous trouvez une règle conflictuelle:" -ForegroundColor Yellow
Write-Host "   1. Modifiez la Page Rule pour exclure les requêtes avec ?token=" -ForegroundColor White
Write-Host "   2. Ou supprimez-la si elle n'est plus nécessaire" -ForegroundColor White
Write-Host "   3. Ou déplacez-la après le Worker dans l'ordre de priorité" -ForegroundColor White
Write-Host ""

# Instructions pour Workers Routes
Write-Host "3️⃣  WORKERS ROUTES (Workers & Pages → protect-sous-domaines-iahome → Triggers)" -ForegroundColor Cyan
Write-Host "─" * 80
Write-Host ""
Write-Host "   Accédez à:" -ForegroundColor White
Write-Host "   https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production/triggers" -ForegroundColor Green
Write-Host ""
Write-Host "   ✅ Routes attendues:" -ForegroundColor Yellow
foreach ($subdomain in $subdomains) {
    Write-Host "     • $subdomain/*" -ForegroundColor Green
}
Write-Host ""
Write-Host "   🔧 Si une route manque:" -ForegroundColor Yellow
Write-Host "   1. Cliquez sur 'Add route'" -ForegroundColor White
Write-Host "   2. Entrez: $subdomain/*" -ForegroundColor White
Write-Host "   3. Sélectionnez la zone: iahome.fr" -ForegroundColor White
Write-Host "   4. Cliquez sur 'Add route'" -ForegroundColor White
Write-Host ""

# Instructions spécifiques pour pdf.iahome.fr
Write-Host "4️⃣  DIAGNOSTIC SPÉCIFIQUE: pdf.iahome.fr" -ForegroundColor Cyan
Write-Host "─" * 80
Write-Host ""
Write-Host "   ⚠️  PROBLÈME DÉTECTÉ:" -ForegroundColor Red
Write-Host "   pdf.iahome.fr redirige même avec un token" -ForegroundColor Red
Write-Host ""
Write-Host "   🔍 À VÉRIFIER EN PRIORITÉ:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Redirect Rules:" -ForegroundColor White
Write-Host "      → Cherchez une règle qui cible 'pdf.iahome.fr/*' ou '*.iahome.fr/*'" -ForegroundColor Gray
Write-Host "      → Vérifiez si elle redirige TOUTES les requêtes" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Page Rules:" -ForegroundColor White
Write-Host "      → Cherchez une règle pour 'pdf.iahome.fr/*'" -ForegroundColor Gray
Write-Host "      → Vérifiez si elle applique une redirection" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Workers Routes:" -ForegroundColor White
Write-Host "      → Vérifiez que 'pdf.iahome.fr/*' est bien dans la liste des routes" -ForegroundColor Gray
Write-Host ""
Write-Host "   4. Code du Worker:" -ForegroundColor White
Write-Host "      → Vérifiez le code du Worker pour voir s'il y a une logique spéciale pour pdf" -ForegroundColor Gray
Write-Host "      → Ouvrez: https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production" -ForegroundColor Gray
Write-Host ""

# Solution proposée pour pdf.iahome.fr
Write-Host "   💡 SOLUTION PROPOSÉE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Si vous trouvez une Redirect Rule pour pdf.iahome.fr:" -ForegroundColor White
Write-Host "   → Modifiez-la pour exclure les requêtes avec token:" -ForegroundColor Gray
Write-Host "     Condition: (http.request.uri.path eq '/') AND NOT (http.request.uri.query contains 'token=')" -ForegroundColor Green
Write-Host "     Action: Redirect to https://iahome.fr/encours?error=direct_access_denied" -ForegroundColor Green
Write-Host ""
Write-Host "   OU supprimez-la si le Worker gère déjà cette protection." -ForegroundColor White
Write-Host ""

# Résumé des liens
Write-Host "📋 RÉSUMÉ DES LIENS IMPORTANTS" -ForegroundColor Cyan
Write-Host "─" * 80
Write-Host ""
Write-Host "   • Dashboard Worker:" -ForegroundColor White
Write-Host "     https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production" -ForegroundColor Green
Write-Host ""
Write-Host "   • Redirect Rules:" -ForegroundColor White
Write-Host "     https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/rules/redirect-rules" -ForegroundColor Green
Write-Host ""
Write-Host "   • Page Rules:" -ForegroundColor White
Write-Host "     https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/rules/page-rules" -ForegroundColor Green
Write-Host ""
Write-Host "   • Workers Routes:" -ForegroundColor White
Write-Host "     https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production/triggers" -ForegroundColor Green
Write-Host ""

# Ouvrir les pages si demandé
Write-Host "🌐 Voulez-vous ouvrir ces pages dans votre navigateur?" -ForegroundColor Yellow
$choice = Read-Host "   1 = Ouvrir tout, 2 = Redirect Rules seulement, 3 = Page Rules seulement, 4 = Worker Dashboard seulement, N = Ne rien ouvrir"

if ($choice -eq "1") {
    Start-Process "https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production"
    Start-Sleep -Seconds 1
    Start-Process "https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/rules/redirect-rules"
    Start-Sleep -Seconds 1
    Start-Process "https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/rules/page-rules"
} elseif ($choice -eq "2") {
    Start-Process "https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/rules/redirect-rules"
} elseif ($choice -eq "3") {
    Start-Process "https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/rules/page-rules"
} elseif ($choice -eq "4") {
    Start-Process "https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production"
}

Write-Host ""
Write-Host "✅ Instructions affichées!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 CONSEIL:" -ForegroundColor Yellow
Write-Host "   Après avoir modifié les règles, réexécutez le script de test:" -ForegroundColor White
Write-Host "   .\test-cloudflare-worker-protection.ps1" -ForegroundColor Green
Write-Host ""


