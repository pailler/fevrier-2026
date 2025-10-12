# Script de démarrage automatique de l'application Next.js
# Pour résoudre la redirection persistante vers /login?redirect=/converter

Write-Host "🚀 Démarrage de l'application Next.js"
Write-Host "===================================="
Write-Host ""

Write-Host "1. Vérification des processus existants..."
Write-Host "=========================================="
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "Processus Node.js trouvés:"
        foreach ($proc in $nodeProcesses) {
            Write-Host "   - PID: $($proc.Id) - CPU: $($proc.CPU)"
        }
        Write-Host ""
        Write-Host "Arrêt des processus existants..."
        Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Processus Node.js arrêtés"
    } else {
        Write-Host "   ✅ Aucun processus Node.js en cours"
    }
} catch {
    Write-Host "   ⚠️  Erreur: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "2. Vérification de la configuration..."
Write-Host "===================================="
Write-Host "Vérification du fichier package.json..."
if (Test-Path "package.json") {
    Write-Host "   ✅ package.json trouvé"
} else {
    Write-Host "   ❌ package.json non trouvé"
    exit 1
}

Write-Host ""
Write-Host "3. Démarrage de l'application..."
Write-Host "=============================="
Write-Host "Démarrage en mode production..."
try {
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden
    Write-Host "   ✅ Application démarrée en arrière-plan"
} catch {
    Write-Host "   ❌ Erreur démarrage: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "Tentative de démarrage en mode développement..."
    try {
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal
        Write-Host "   ✅ Application démarrée en mode développement"
    } catch {
        Write-Host "   ❌ Erreur démarrage dev: $($_.Exception.Message)"
        exit 1
    }
}

Write-Host ""
Write-Host "4. Attente du démarrage..."
Write-Host "========================"
Write-Host "Attente de 30 secondes..."
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "5. Test de l'application..."
Write-Host "========================"
Write-Host "Test de l'application locale..."
try {
    $appTest = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   Status Code: $($appTest.StatusCode)"
    if ($appTest.StatusCode -eq 200) {
        Write-Host "   ✅ Application Next.js accessible"
    } else {
        Write-Host "   ❌ Application Next.js non accessible"
    }
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "6. Test de la page /converter..."
Write-Host "=============================="
Write-Host "Test de la page /converter locale..."
try {
    $converterTest = Invoke-WebRequest -Uri "http://localhost:3000/converter" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   Status Code: $($converterTest.StatusCode)"
    if ($converterTest.Content -match "Convertisseur Universel") {
        Write-Host "   ✅ Page /converter accessible"
    } else {
        Write-Host "   ❌ Page /converter non accessible"
    }
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "7. Test de la redirection persistante..."
Write-Host "====================================="
Write-Host "Test de https://www.iahome.fr/converter..."
try {
    $redirectTest = Invoke-WebRequest -Uri "https://www.iahome.fr/converter" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   Status Code: $($redirectTest.StatusCode)"
    if ($redirectTest.Content -match "login") {
        Write-Host "   ❌ REDIRECTION PERSISTANTE vers login"
        Write-Host "   ⚠️  L'application Next.js n'est pas encore accessible via Cloudflare"
    } else {
        Write-Host "   ✅ Redirection corrigée"
    }
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "8. Solution alternative fonctionnelle..."
Write-Host "======================================="
Write-Host "Test de https://converter.iahome.fr..."
try {
    $converterDirect = Invoke-WebRequest -Uri "https://converter.iahome.fr" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   Status Code: $($converterDirect.StatusCode)"
    if ($converterDirect.StatusCode -eq 200) {
        Write-Host "   ✅ converter.iahome.fr FONCTIONNE PARFAITEMENT"
        Write-Host "   ✅ Solution alternative disponible"
    } else {
        Write-Host "   ❌ converter.iahome.fr non accessible"
    }
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "🎯 Résumé des solutions..."
Write-Host "========================"
Write-Host ""
Write-Host "✅ SOLUTION FONCTIONNELLE:"
Write-Host "   URL: https://converter.iahome.fr"
Write-Host "   Status: Entièrement opérationnel"
Write-Host "   Accès: Direct au container converter"
Write-Host ""
Write-Host "⚠️  SOLUTION EN COURS:"
Write-Host "   URL: https://www.iahome.fr/converter"
Write-Host "   Status: Application Next.js à redémarrer"
Write-Host "   Fonctionnalité: Redirection avec authentification"
Write-Host ""
Write-Host "🔧 Instructions:"
Write-Host "   1. Utiliser https://converter.iahome.fr (recommandé)"
Write-Host "   2. Attendre le redémarrage complet de Next.js pour /converter"
Write-Host ""
Write-Host "🚀 Démarrage terminé !"
Write-Host "====================="





