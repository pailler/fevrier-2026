# Script pour appliquer le patch de correction Supabase
# Remplace tous les usages directs de process.env.NEXT_PUBLIC_SUPABASE_* par l'utilitaire centralisé

Write-Host "🔧 APPLICATION DU PATCH SUPABASE" -ForegroundColor Cyan
Write-Host "===============================`n" -ForegroundColor Cyan

# Liste des fichiers à corriger
$filesToFix = @(
    "src/app/api/user-tokens-simple/route.ts",
    "src/app/api/user-tokens-simple/history/route.ts",
    "src/app/api/auth/signin-alternative/route.ts",
    "src/app/api/auth/set-password-oauth/route.ts",
    "src/app/api/auth/sync-oauth-profile/route.ts",
    "src/app/api/auth/signup/route.ts",
    "src/app/api/auth/signup-alternative/route.ts",
    "src/app/api/auth/callback/route.ts",
    "src/app/api/auth/reset-password/route.ts",
    "src/app/api/auth/verify-email/route.ts",
    "src/app/api/auth/forgot-password/route.ts",
    "src/app/api/activate-psitransfer/route.ts",
    "src/app/api/increment-psitransfer-access/route.ts",
    "src/app/api/verify-password/route.ts",
    "src/app/api/qr/redirect/[qrId]/route.ts",
    "src/app/api/qr/manage/[qrId]/route.ts",
    "src/app/api/admin-users/route.ts",
    "src/app/api/admin/users/route.ts",
    "src/app/api/qr-proxy/[...path]/route.ts",
    "src/app/api/activate-librespeed-test/route.ts",
    "src/app/api/test-qrcode-access/route.ts",
    "src/app/api/test-librespeed-db/route.ts",
    "src/app/api/test-db/route.ts",
    "src/app/api/notification-send/route.ts",
    "src/app/api/admin/setup-notifications/route.ts",
    "src/app/api/admin/init-notifications/route.ts",
    "src/app/api/admin/create-notification-tables/route.ts",
    "src/app/api/admin/statistics/route.ts",
    "src/app/api/test-librespeed-access/route.ts",
    "src/app/api/validate-module-access/route.ts",
    "src/app/api/admin/active-applications/route.ts",
    "src/app/api/create-code-learning-module/route.ts",
    "src/app/api/code-learning-access/route.ts",
    "src/app/api/activate-code-learning/route.ts",
    "src/utils/sessionDurationCheck.ts",
    "src/utils/sessionManager.ts",
    "src/utils/emailService.ts"
)

$fixedCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($file in $filesToFix) {
    if (-not (Test-Path $file)) {
        Write-Host "⚠️  Fichier non trouvé: $file" -ForegroundColor Yellow
        $skippedCount++
        continue
    }

    try {
        $content = Get-Content $file -Raw
        
        # Vérifier si le fichier utilise process.env.NEXT_PUBLIC_SUPABASE
        if ($content -match "process\.env\.NEXT_PUBLIC_SUPABASE") {
            Write-Host "🔧 Correction de: $file" -ForegroundColor Yellow
            
            # Ajouter l'import si nécessaire
            if ($content -notmatch "from '@/utils/supabaseConfig'") {
                # Trouver la ligne d'import de createClient
                if ($content -match "(import.*createClient.*from.*@supabase/supabase-js[^\n]*)") {
                    $importLine = $matches[1]
                    $newImport = "$importLine`nimport { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';"
                    $content = $content -replace [regex]::Escape($importLine), $newImport
                } else {
                    # Ajouter l'import au début du fichier
                    $content = "import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from '@/utils/supabaseConfig';`n" + $content
                }
            }
            
            # Remplacer process.env.NEXT_PUBLIC_SUPABASE_URL! par getSupabaseUrl()
            $content = $content -replace "process\.env\.NEXT_PUBLIC_SUPABASE_URL!", "getSupabaseUrl()"
            
            # Remplacer process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! par getSupabaseAnonKey()
            $content = $content -replace "process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY!", "getSupabaseAnonKey()"
            
            # Remplacer process.env.SUPABASE_SERVICE_ROLE_KEY! par getSupabaseServiceRoleKey()
            $content = $content -replace "process\.env\.SUPABASE_SERVICE_ROLE_KEY!", "getSupabaseServiceRoleKey()"
            
            # Sauvegarder le fichier
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "   ✅ Fichier corrigé" -ForegroundColor Green
            $fixedCount++
        } else {
            Write-Host "   ℹ️  Fichier déjà correct: $file" -ForegroundColor Gray
            $skippedCount++
        }
    } catch {
        Write-Host "   ❌ Erreur lors de la correction: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n📊 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host "   ✅ Fichiers corrigés: $fixedCount" -ForegroundColor Green
Write-Host "   ℹ️  Fichiers ignorés: $skippedCount" -ForegroundColor Gray
Write-Host "   ❌ Erreurs: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Gray" })

if ($fixedCount -gt 0) {
    Write-Host "`n🔄 Rebuild nécessaire:" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.prod.yml build iahome-app --no-cache" -ForegroundColor White
    Write-Host "   docker-compose -f docker-compose.prod.yml up -d iahome-app" -ForegroundColor White
}


