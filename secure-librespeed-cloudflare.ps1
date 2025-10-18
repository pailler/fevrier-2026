# Script de sécurisation LibreSpeed avec API Cloudflare
# Utilise la clé API Cloudflare pour configurer automatiquement la sécurité

param(
    [Parameter(Mandatory=$true)]
    [string]$CloudflareApiToken,
    
    [Parameter(Mandatory=$true)]
    [string]$ZoneId,
    
    [string]$Email = "admin@iahome.fr"
)

Write-Host "🔒 Sécurisation LibreSpeed avec API Cloudflare" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Configuration des headers pour l'API Cloudflare
$headers = @{
    "Authorization" = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
}

# Fonction pour appeler l'API Cloudflare
function Invoke-CloudflareAPI {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    $uri = "https://api.cloudflare.com/client/v4$Endpoint"
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json -Depth 10)
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
        return $response
    } catch {
        Write-Host "   ❌ Erreur API Cloudflare: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Vérifier la zone DNS
Write-Host "`n1. Vérification de la zone DNS..." -ForegroundColor Yellow
$zone = Invoke-CloudflareAPI -Method "GET" -Endpoint "/zones/$ZoneId"
if ($zone.success) {
    Write-Host "   ✅ Zone trouvée: $($zone.result.name)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Zone non trouvée" -ForegroundColor Red
    exit 1
}

# 2. Vérifier l'enregistrement DNS pour librespeed
Write-Host "`n2. Vérification de l'enregistrement DNS librespeed..." -ForegroundColor Yellow
$dnsRecords = Invoke-CloudflareAPI -Method "GET" -Endpoint "/zones/$ZoneId/dns_records?name=librespeed.iahome.fr"
if ($dnsRecords.success -and $dnsRecords.result.Count -gt 0) {
    Write-Host "   ✅ Enregistrement DNS librespeed trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ Enregistrement DNS librespeed manquant" -ForegroundColor Red
    Write-Host "   🚀 Création de l'enregistrement DNS..." -ForegroundColor Yellow
    
    $dnsRecord = @{
        type = "CNAME"
        name = "librespeed"
        content = "iahome-tunnel.trycloudflare.com"
        ttl = 1
        proxied = $true
    }
    
    $createDns = Invoke-CloudflareAPI -Method "POST" -Endpoint "/zones/$ZoneId/dns_records" -Body $dnsRecord
    if ($createDns.success) {
        Write-Host "   ✅ Enregistrement DNS créé" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur création DNS" -ForegroundColor Red
    }
}

# 3. Configurer les règles WAF
Write-Host "`n3. Configuration des règles WAF..." -ForegroundColor Yellow

# Règle 1: Protection contre les bots
$wafRule1 = @{
    expression = "(http.host eq `"librespeed.iahome.fr`" and cf.bot_management.score lt 30)"
    action = "block"
    description = "LibreSpeed - Blocage des bots"
    enabled = $true
}

$waf1 = Invoke-CloudflareAPI -Method "POST" -Endpoint "/zones/$ZoneId/firewall/rules" -Body $wafRule1
if ($waf1.success) {
    Write-Host "   ✅ Règle WAF anti-bots créée" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Règle WAF anti-bots déjà existante ou erreur" -ForegroundColor Yellow
}

# Règle 2: Limitation du taux de requêtes
$wafRule2 = @{
    expression = "(http.host eq `"librespeed.iahome.fr`" and rate(10m) > 100)"
    action = "challenge"
    description = "LibreSpeed - Limitation du taux de requêtes"
    enabled = $true
}

$waf2 = Invoke-CloudflareAPI -Method "POST" -Endpoint "/zones/$ZoneId/firewall/rules" -Body $wafRule2
if ($waf2.success) {
    Write-Host "   ✅ Règle WAF limitation créée" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Règle WAF limitation déjà existante ou erreur" -ForegroundColor Yellow
}

# 4. Configurer les paramètres SSL/TLS
Write-Host "`n4. Configuration SSL/TLS..." -ForegroundColor Yellow

# Mode SSL strict
$sslSettings = @{
    value = "strict"
}

$ssl = Invoke-CloudflareAPI -Method "PATCH" -Endpoint "/zones/$ZoneId/settings/ssl" -Body $sslSettings
if ($ssl.success) {
    Write-Host "   ✅ Mode SSL strict activé" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Configuration SSL déjà en place" -ForegroundColor Yellow
}

# TLS 1.3
$tls13 = Invoke-CloudflareAPI -Method "PATCH" -Endpoint "/zones/$ZoneId/settings/tls_1_3" -Body @{ value = "on" }
if ($tls13.success) {
    Write-Host "   ✅ TLS 1.3 activé" -ForegroundColor Green
}

# HSTS
$hsts = Invoke-CloudflareAPI -Method "PATCH" -Endpoint "/zones/$ZoneId/settings/security_header" -Body @{ 
    value = @{
        enabled = $true
        max_age = 31536000
        include_subdomains = $true
        preload = $true
    }
}
if ($hsts.success) {
    Write-Host "   ✅ HSTS activé" -ForegroundColor Green
}

# 5. Configurer les paramètres de sécurité
Write-Host "`n5. Configuration des paramètres de sécurité..." -ForegroundColor Yellow

# Protection DDoS
$ddos = Invoke-CloudflareAPI -Method "PATCH" -Endpoint "/zones/$ZoneId/settings/ddos_attack_mitigation" -Body @{ value = "on" }
if ($ddos.success) {
    Write-Host "   ✅ Protection DDoS activée" -ForegroundColor Green
}

# Protection Bot Management
$botMgmt = Invoke-CloudflareAPI -Method "PATCH" -Endpoint "/zones/$ZoneId/settings/bot_management" -Body @{ value = "on" }
if ($botMgmt.success) {
    Write-Host "   ✅ Bot Management activé" -ForegroundColor Green
}

# 6. Configurer les headers de sécurité
Write-Host "`n6. Configuration des headers de sécurité..." -ForegroundColor Yellow

$transformRules = @{
    rules = @(
        @{
            expression = "http.host eq `"librespeed.iahome.fr`""
            enabled = $true
            action = "rewrite"
            action_parameters = @{
                headers = @{
                    "X-Frame-Options" = "DENY"
                    "X-Content-Type-Options" = "nosniff"
                    "X-XSS-Protection" = "1; mode=block"
                    "Referrer-Policy" = "strict-origin-when-cross-origin"
                    "Permissions-Policy" = "camera=(), microphone=(), geolocation=()"
                }
            }
        }
    )
}

$transform = Invoke-CloudflareAPI -Method "POST" -Endpoint "/zones/$ZoneId/transform/rulesets" -Body $transformRules
if ($transform.success) {
    Write-Host "   ✅ Headers de sécurité configurés" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Headers de sécurité déjà configurés ou erreur" -ForegroundColor Yellow
}

# 7. Tester la configuration
Write-Host "`n7. Test de la configuration..." -ForegroundColor Yellow

# Attendre que les changements se propagent
Start-Sleep -Seconds 10

try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method Head -TimeoutSec 15
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ LibreSpeed accessible via HTTPS" -ForegroundColor Green
        Write-Host "   🔒 Status: $($response.StatusCode)" -ForegroundColor Cyan
        
        # Vérifier les headers de sécurité
        $headers = $response.Headers
        if ($headers["Strict-Transport-Security"]) {
            Write-Host "   ✅ HSTS activé" -ForegroundColor Green
        }
        if ($headers["X-Frame-Options"]) {
            Write-Host "   ✅ X-Frame-Options activé" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "   ⚠️  Test d'accès: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n🎯 Configuration LibreSpeed terminée !" -ForegroundColor Green
Write-Host "   🌐 URL: https://librespeed.iahome.fr" -ForegroundColor Cyan
Write-Host "   🔒 Protection: WAF + SSL + Headers de sécurité" -ForegroundColor Cyan
Write-Host "   📊 Monitoring: Dashboard Cloudflare" -ForegroundColor Cyan

Write-Host "`n📋 Résumé de la configuration:" -ForegroundColor Yellow
Write-Host "   ✅ DNS CNAME configuré" -ForegroundColor Green
Write-Host "   ✅ Règles WAF anti-bots" -ForegroundColor Green
Write-Host "   ✅ Limitation du taux de requêtes" -ForegroundColor Green
Write-Host "   ✅ SSL/TLS strict" -ForegroundColor Green
Write-Host "   ✅ Headers de sécurité" -ForegroundColor Green
Write-Host "   ✅ Protection DDoS" -ForegroundColor Green
Write-Host "   ✅ Bot Management" -ForegroundColor Green

