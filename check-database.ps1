# Script pour vérifier l'état de la base de données Supabase

Write-Host "🔍 Vérification de la base de données Supabase" -ForegroundColor Cyan

# Test 1: Vérifier si l'utilisateur existe dans profiles
Write-Host "`n📡 Test 1: Vérification table profiles" -ForegroundColor Yellow

$profileData = @{
    email = "regispailler@gmail.com"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/check-profile" -Method POST -Body $profileData -ContentType "application/json"
    Write-Host "✅ Profile Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Erreur vérification profile:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 2: Vérifier directement la table user_tokens
Write-Host "`n📡 Test 2: Vérification table user_tokens" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/check-user-tokens?email=regispailler@gmail.com" -Method GET
    Write-Host "✅ User Tokens Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Erreur vérification user_tokens:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n🏁 Vérification terminée" -ForegroundColor Cyan



