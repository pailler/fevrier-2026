# Script de diagnostic pour le système de notifications
Write-Host "Diagnostic du systeme de notifications..." -ForegroundColor Blue

# Vérifier les fichiers essentiels
$files = @(
    "src/utils/notificationService.ts",
    "src/utils/useNotifications.ts", 
    "src/app/api/admin/notifications/route.ts",
    "src/app/admin/page.tsx"
)

Write-Host "Verification des fichiers..." -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file" -ForegroundColor Red
    }
}

# Vérifier les imports dans la page admin
Write-Host ""
Write-Host "Verification des imports dans admin/page.tsx..." -ForegroundColor Yellow
$adminContent = Get-Content "src/app/admin/page.tsx" -Raw
if ($adminContent -match "NotificationService") {
    Write-Host "  ✅ Import NotificationService present" -ForegroundColor Green
} else {
    Write-Host "  ❌ Import NotificationService manquant" -ForegroundColor Red
}

if ($adminContent -match "activeTab.*notifications") {
    Write-Host "  ✅ Onglet notifications dans activeTab" -ForegroundColor Green
} else {
    Write-Host "  ❌ Onglet notifications manquant dans activeTab" -ForegroundColor Red
}

if ($adminContent -match "setActiveTab.*notifications") {
    Write-Host "  ✅ Bouton notifications present" -ForegroundColor Green
} else {
    Write-Host "  ❌ Bouton notifications manquant" -ForegroundColor Red
}

# Vérifier la configuration
Write-Host ""
Write-Host "Verification de la configuration..." -ForegroundColor Yellow
$envFile = ".env.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    $emailProvider = $envContent | Where-Object { $_ -match "EMAIL_PROVIDER" } | ForEach-Object { ($_ -split "=")[1] }
    $resendApiKey = $envContent | Where-Object { $_ -match "RESEND_API_KEY" } | ForEach-Object { ($_ -split "=")[1] }
    
    if ($emailProvider -eq "resend" -and $resendApiKey) {
        Write-Host "  ✅ Configuration Resend valide" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Configuration Resend incomplete" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Fichier .env.local non trouve" -ForegroundColor Red
}

Write-Host ""
Write-Host "Diagnostic termine!" -ForegroundColor Blue
Write-Host "Si tous les fichiers sont presents, essayez de:" -ForegroundColor Yellow
Write-Host "1. Vider le cache du navigateur" -ForegroundColor White
Write-Host "2. Redemarrer l'application" -ForegroundColor White
Write-Host "3. Verifier la console du navigateur pour les erreurs" -ForegroundColor White
