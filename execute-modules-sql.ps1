# Script pour exécuter le SQL de création de la table modules
$sqlContent = Get-Content "create-modules-table.sql" -Raw

# Utiliser l'API Supabase pour exécuter le SQL
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM"
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM"
}

$body = @{
    query = $sqlContent
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://xemtoyzcihmncbrlsmhr.supabase.co/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body
    Write-Host "✅ Table modules créée avec succès"
    Write-Host $response
} catch {
    Write-Host "❌ Erreur lors de la création de la table modules:"
    Write-Host $_.Exception.Message
    
    # Essayer une approche alternative avec l'API REST
    Write-Host "🔄 Tentative alternative..."
    
    # Créer la table via l'API REST
    $createTableBody = @{
        name = "modules"
        columns = @(
            @{ name = "id"; type = "int4"; is_primary_key = $true; is_identity = $true },
            @{ name = "title"; type = "varchar"; length = 255; is_nullable = $false },
            @{ name = "description"; type = "text"; is_nullable = $true },
            @{ name = "category"; type = "varchar"; length = 100; is_nullable = $true },
            @{ name = "price"; type = "numeric"; precision = 10; scale = 2; default_value = "0.00" },
            @{ name = "icon"; type = "varchar"; length = 10; is_nullable = $true },
            @{ name = "is_paid"; type = "bool"; default_value = "false" },
            @{ name = "created_at"; type = "timestamptz"; default_value = "now()" },
            @{ name = "updated_at"; type = "timestamptz"; default_value = "now()" }
        )
    } | ConvertTo-Json -Depth 3
    
    try {
        $response2 = Invoke-RestMethod -Uri "https://xemtoyzcihmncbrlsmhr.supabase.co/rest/v1/" -Method Post -Headers $headers -Body $createTableBody
        Write-Host "✅ Table modules créée via API REST"
    } catch {
        Write-Host "❌ Échec de la création via API REST:"
        Write-Host $_.Exception.Message
    }
}
