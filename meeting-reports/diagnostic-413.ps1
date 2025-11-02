# Script de diagnostic pour l'erreur 413 (Content Too Large)
# Meeting Reports - Upload de fichiers volumineux

Write-Host "🔍 Diagnostic de l'erreur 413 - Meeting Reports" -ForegroundColor Cyan
Write-Host "=" * 70
Write-Host ""

# 1. Vérifier la configuration Traefik
Write-Host "1️⃣ Vérification de la configuration Traefik..." -ForegroundColor Yellow
try {
    $traefikConfig = docker exec iahome-traefik cat /etc/traefik/dynamic/meeting-reports-api.yml 2>&1
    if ($traefikConfig -match "memRequestBodyBytes:\s*524288000") {
        Write-Host "   ✅ Traefik configuré à 500 MB (524288000 bytes)" -ForegroundColor Green
    } elseif ($traefikConfig -match "memRequestBodyBytes:\s*(\d+)") {
        $size = [int]$matches[1] / 1024 / 1024
        Write-Host "   ⚠️ Traefik configuré à $size MB (au lieu de 500 MB)" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Configuration Traefik non trouvée ou incorrecte" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Impossible de vérifier Traefik: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2. Vérifier les logs Traefik pour voir si la requête arrive
Write-Host "2️⃣ Vérification des logs Traefik (dernières 20 lignes)..." -ForegroundColor Yellow
try {
    $traefikLogs = docker logs iahome-traefik --tail=20 2>&1
    if ($traefikLogs -match "meeting-reports.*upload|413|Content.*Large") {
        Write-Host "   ⚠️ Des erreurs 413 trouvées dans les logs Traefik" -ForegroundColor Yellow
        $matches = $traefikLogs | Select-String -Pattern "413|upload|meeting-reports"
        foreach ($match in $matches) {
            Write-Host "   $($match.Line)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ✅ Aucune erreur 413 dans les logs Traefik récents" -ForegroundColor Green
        Write-Host "   💡 Si aucune requête n'apparaît, Cloudflare bloque peut-être avant Traefik" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Impossible de vérifier les logs Traefik" -ForegroundColor Red
}

Write-Host ""

# 3. Vérifier les logs Backend
Write-Host "3️⃣ Vérification des logs Backend (dernières 20 lignes)..." -ForegroundColor Yellow
try {
    $backendLogs = docker logs meeting-reports-backend-1 --tail=20 2>&1
    if ($backendLogs -match "UPLOAD ENDPOINT|upload.*413|Content.*Large") {
        Write-Host "   ⚠️ Des erreurs d'upload trouvées dans les logs Backend" -ForegroundColor Yellow
        $matches = $backendLogs | Select-String -Pattern "upload|413|UPLOAD"
        foreach ($match in $matches) {
            Write-Host "   $($match.Line)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ✅ Aucune erreur d'upload dans les logs Backend récents" -ForegroundColor Green
        Write-Host "   💡 Si aucune requête n'apparaît, la requête n'atteint pas le backend" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️ Impossible de vérifier les logs Backend (service peut-être arrêté)" -ForegroundColor Yellow
}

Write-Host ""

# 4. Test direct du backend (bypass Cloudflare/Traefik)
Write-Host "4️⃣ Test direct du backend (localhost:8000)..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 5 -ErrorAction Stop
    if ($healthCheck.status -eq "healthy") {
        Write-Host "   ✅ Backend accessible directement (healthy)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Backend accessible mais status: $($healthCheck.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 5. Vérifier Cloudflare (si possible)
Write-Host "5️⃣ Informations sur Cloudflare..." -ForegroundColor Yellow
Write-Host "   📋 Pour vérifier si Cloudflare bloque:" -ForegroundColor Gray
Write-Host "   1. Aller sur https://dash.cloudflare.com" -ForegroundColor Gray
Write-Host "   2. DNS > Records > meeting-reports.iahome.fr" -ForegroundColor Gray
Write-Host "   3. Vérifier l'icône:" -ForegroundColor Gray
Write-Host "      🟠 Orange (Proxied) = Limite 100 MB par défaut" -ForegroundColor Yellow
Write-Host "      ⚪ Gris (DNS only) = Pas de limite Cloudflare" -ForegroundColor Green
Write-Host ""
Write-Host "   ⚠️ Si l'icône est ORANGE et fichier > 100 MB → C'est Cloudflare qui bloque!" -ForegroundColor Yellow

Write-Host ""

# 6. Recommandations
Write-Host "6️⃣ Recommandations selon les résultats:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Si requête n'atteint PAS Traefik/Backend:" -ForegroundColor Cyan
Write-Host "   → C'est Cloudflare qui bloque (limite 100 MB)" -ForegroundColor Yellow
Write-Host "   → Solution: Passer en DNS only ou utiliser endpoint direct" -ForegroundColor Gray
Write-Host ""
Write-Host "   Si requête atteint Traefik mais erreur 413:" -ForegroundColor Cyan
Write-Host "   → Vérifier que memRequestBodyBytes = 524288000" -ForegroundColor Yellow
Write-Host "   → Solution: Redémarrer Traefik" -ForegroundColor Gray
Write-Host ""
Write-Host "   Si requête atteint Backend:" -ForegroundColor Cyan
Write-Host "   → Vérifier le middleware dans main.py (MAX_UPLOAD_SIZE)" -ForegroundColor Yellow
Write-Host "   → Solution: Vérifier la configuration backend" -ForegroundColor Gray

Write-Host ""
Write-Host "=" * 70
Write-Host "📝 Diagnostic terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Pour plus de details, voir: meeting-reports/DIAGNOSTIC_413.md" -ForegroundColor Cyan

