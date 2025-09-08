# Script pour réactiver les vérifications LibreSpeed après configuration Supabase
Write-Host "🔄 Réactivation des vérifications LibreSpeed" -ForegroundColor Cyan

Write-Host "`n📋 Ce script va réactiver les vérifications de base de données dans:" -ForegroundColor Blue
Write-Host "   - src/app/api/check-auth/route.ts" -ForegroundColor White
Write-Host "   - src/app/librespeed-interface/page.tsx" -ForegroundColor White

$confirm = Read-Host "`nVoulez-vous continuer ? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Opération annulée" -ForegroundColor Red
    exit
}

Write-Host "`n🔄 Réactivation en cours..." -ForegroundColor Yellow

# 1. Réactiver les vérifications dans check-auth/route.ts
Write-Host "`n1️⃣ Réactivation des vérifications dans check-auth/route.ts..." -ForegroundColor Yellow

$checkAuthFile = "src/app/api/check-auth/route.ts"
if (Test-Path $checkAuthFile) {
    $content = Get-Content $checkAuthFile -Raw
    
    # Remplacer les vérifications commentées par les vraies vérifications
    $content = $content -replace "    // TEMPORAIRE: Ignorer la vérification en attendant la configuration de la base de données`n    console\.log\('LibreSpeed Proxy: Vérification du module temporairement désactivée pour:', session\.user\.email\);`n    `n    // TODO: Réactiver après configuration de la base de données Supabase`n    // const isModuleInEncours = await checkModuleInEncours\(session\.user\.id\);`n    // if \(!isModuleInEncours\) {`n    //   console\.log\('LibreSpeed Proxy: Module LibreSpeed non visible dans /encours pour:', session\.user\.email\);`n    //   return NextResponse\.redirect\('https://iahome\.fr/encours', 302\);`n    // }", "    // Vérifier si le module apparaît dans /encours (vérification principale)`n    const isModuleInEncours = await checkModuleInEncours(session.user.id);`n    `n    if (!isModuleInEncours) {`n      console.log('LibreSpeed Proxy: Module LibreSpeed non visible dans /encours pour:', session.user.email);`n      return NextResponse.redirect('https://iahome.fr/encours', 302);`n    }"
    
    $content = $content -replace "    // TEMPORAIRE: Ignorer la vérification en attendant la configuration de la base de données`n    console\.log\('LibreSpeed Proxy: Vérification des tokens temporairement désactivée pour:', session\.user\.email\);`n    `n    // TODO: Réactiver après configuration de la base de données Supabase`n    // const hasValidAccess = await checkValidModuleAccess\(session\.user\.id\);`n    // if \(!hasValidAccess\) {`n    //   console\.log\('LibreSpeed Proxy: Accès au module LibreSpeed invalide ou expiré pour:', session\.user\.email\);`n    //   return NextResponse\.redirect\('https://iahome\.fr/encours', 302\);`n    // }", "    // Vérifier que l'utilisateur a un accès actif au module (tokens d'accès)`n    const hasValidAccess = await checkValidModuleAccess(session.user.id);`n    `n    if (!hasValidAccess) {`n      console.log('LibreSpeed Proxy: Accès au module LibreSpeed invalide ou expiré pour:', session.user.email);`n      return NextResponse.redirect('https://iahome.fr/encours', 302);`n    }"
    
    Set-Content $checkAuthFile $content -Encoding UTF8
    Write-Host "✅ Vérifications réactivées dans check-auth/route.ts" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier check-auth/route.ts non trouvé" -ForegroundColor Red
}

# 2. Réactiver les vérifications dans librespeed-interface/page.tsx
Write-Host "`n2️⃣ Réactivation des vérifications dans librespeed-interface/page.tsx..." -ForegroundColor Yellow

$interfaceFile = "src/app/librespeed-interface/page.tsx"
if (Test-Path $interfaceFile) {
    $content = Get-Content $interfaceFile -Raw
    
    # Remplacer la redirection directe par les vraies vérifications
    $content = $content -replace "        // TEMPORAIRE: Redirection directe sans vérification en attendant la configuration de la base de données`n        console\.log\('✅ Accès temporairement autorisé - redirection directe vers LibreSpeed';`n        window\.location\.href = 'https://librespeed\.iahome\.fr';`n        `n        // TODO: Réactiver après configuration de la base de données Supabase`n        // Vérifier l'accès via notre proxy d'authentification`n        // const response = await fetch\('/api/check-auth', {`n        //   method: 'GET',`n        //   credentials: 'include',`n        //   headers: {`n        //     'Host': 'librespeed\.iahome\.fr',`n        //     'Referer': 'https://iahome\.fr/encours',`n        //     'Origin': 'https://iahome\.fr'`n        //   }`n        // });`n        `n        // if \(response\.ok\) {`n        //   console\.log\('✅ Accès autorisé à LibreSpeed - redirection directe';`n        //   // Rediriger directement vers LibreSpeed`n        //   window\.location\.href = 'https://librespeed\.iahome\.fr';`n        // } else {`n        //   console\.log\('❌ Accès refusé à LibreSpeed';`n        //   setError\('Accès refusé\. Vérifiez que vous avez accès au module LibreSpeed\.';`n        // }", "        // Vérifier l'accès via notre proxy d'authentification`n        const response = await fetch('/api/check-auth', {`n          method: 'GET',`n          credentials: 'include',`n          headers: {`n            'Host': 'librespeed.iahome.fr',`n            'Referer': 'https://iahome.fr/encours',`n            'Origin': 'https://iahome.fr'`n          }`n        });`n        `n        if (response.ok) {`n          console.log('✅ Accès autorisé à LibreSpeed - redirection directe');`n          // Rediriger directement vers LibreSpeed`n          window.location.href = 'https://librespeed.iahome.fr';`n        } else {`n          console.log('❌ Accès refusé à LibreSpeed');`n          setError('Accès refusé. Vérifiez que vous avez accès au module LibreSpeed.');`n        }"
    
    Set-Content $interfaceFile $content -Encoding UTF8
    Write-Host "✅ Vérifications réactivées dans librespeed-interface/page.tsx" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier librespeed-interface/page.tsx non trouvé" -ForegroundColor Red
}

Write-Host "`n🎉 Réactivation terminée !" -ForegroundColor Green
Write-Host "`n📋 Prochaines étapes:" -ForegroundColor Blue
Write-Host "   1. Redémarrer l'application: docker restart iahome-app" -ForegroundColor White
Write-Host "   2. Tester l'accès via le bouton sur /encours" -ForegroundColor White
Write-Host "   3. Vérifier que l'authentification fonctionne correctement" -ForegroundColor White
Write-Host "`n⚠️  Assurez-vous d'avoir exécuté le script SQL dans Supabase avant de continuer !" -ForegroundColor Yellow

