# Script pour créer une seule Page Rule Cloudflare
# Bloque tous les sous-domaines avec une seule règle

$CloudflareApiToken = "wkhkSnnSNWU8uNAkP0M0bqVrNRWlfTxU_5WCCSsG"
$ZoneId = "8e3782f7423cf8735c045eeabf8c6cf5"

$headers = @{
    "Authorization" = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
}

Write-Host "Creation d'une Page Rule unique pour bloquer tous les sous-domaines" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan

# 1. Supprimer les Page Rules existantes (optionnel)
Write-Host "`n1. Verification des Page Rules existantes..." -ForegroundColor Yellow
try {
    $existingRules = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/pagerules" -Method GET -Headers $headers
    Write-Host "   Page Rules existantes: $($existingRules.result.Count)" -ForegroundColor Green
    
    # Supprimer les anciennes règles si elles existent
    foreach ($rule in $existingRules.result) {
        if ($rule.targets[0].constraint.value -like "*.iahome.fr/*") {
            Write-Host "   Suppression de l'ancienne regle: $($rule.targets[0].constraint.value)" -ForegroundColor Yellow
            try {
                $deleteResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/pagerules/$($rule.id)" -Method DELETE -Headers $headers
                Write-Host "   ✅ Ancienne regle supprimee" -ForegroundColor Green
            } catch {
                Write-Host "   ⚠️  Erreur suppression: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    }
} catch {
    Write-Host "   Erreur lors de la verification: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Créer la Page Rule unique pour tous les sous-domaines
Write-Host "`n2. Creation de la Page Rule unique..." -ForegroundColor Yellow

$pageRuleData = @{
    targets = @(
        @{
            target = "url"
            constraint = @{
                operator = "matches"
                value = "*.iahome.fr/*"
            }
        }
    )
    actions = @(
        @{
            id = "forwarding_url"
            value = @{
                url = "https://iahome.fr/encours"
                status_code = 302
            }
        }
    )
    status = "active"
    priority = 1
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/pagerules" -Method POST -Headers $headers -Body $pageRuleData
    Write-Host "   ✅ Page Rule unique creee avec succes" -ForegroundColor Green
    Write-Host "   ID: $($response.result.id)" -ForegroundColor White
    Write-Host "   Pattern: *.iahome.fr/*" -ForegroundColor White
    Write-Host "   Redirection: https://iahome.fr/encours (302)" -ForegroundColor White
} catch {
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "   ⚠️  Page Rule deja existante" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Erreur creation Page Rule: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "   Details: $errorBody" -ForegroundColor Red
        }
    }
}

# 3. Vérifier la configuration finale
Write-Host "`n3. Verification de la configuration finale..." -ForegroundColor Yellow
try {
    $finalRules = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/pagerules" -Method GET -Headers $headers
    Write-Host "   Page Rules actives: $($finalRules.result.Count)" -ForegroundColor Green
    
    foreach ($rule in $finalRules.result) {
        $target = $rule.targets[0].constraint.value
        $action = $rule.actions[0].value.url
        $status = $rule.status
        $priority = $rule.priority
        Write-Host "   - $target -> $action ($status, priorite: $priority)" -ForegroundColor White
    }
} catch {
    Write-Host "   Erreur lors de la verification: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Configuration terminee !" -ForegroundColor Green
Write-Host "`nProtection appliquee avec UNE SEULE regle :" -ForegroundColor Cyan
Write-Host "   • Pattern: *.iahome.fr/*" -ForegroundColor White
Write-Host "   • Action: Redirection 302 vers https://iahome.fr/encours" -ForegroundColor White
Write-Host "   • Priorite: 1 (la plus haute)" -ForegroundColor White
Write-Host "   • Status: Active" -ForegroundColor White

Write-Host "`nSous-domaines proteges :" -ForegroundColor Yellow
Write-Host "   • librespeed.iahome.fr" -ForegroundColor White
Write-Host "   • meeting-reports.iahome.fr" -ForegroundColor White
Write-Host "   • whisper.iahome.fr" -ForegroundColor White
Write-Host "   • comfyui.iahome.fr" -ForegroundColor White
Write-Host "   • stablediffusion.iahome.fr" -ForegroundColor White
Write-Host "   • qrcodes.iahome.fr" -ForegroundColor White
Write-Host "   • psitransfer.iahome.fr" -ForegroundColor White
Write-Host "   • metube.iahome.fr" -ForegroundColor White
Write-Host "   • pdf.iahome.fr" -ForegroundColor White
Write-Host "   • ET TOUS LES AUTRES sous-domaines *.iahome.fr" -ForegroundColor White

Write-Host "`nLa configuration peut prendre 2-3 minutes pour etre active" -ForegroundColor Yellow
Write-Host "Testez avec: https://librespeed.iahome.fr" -ForegroundColor Cyan
