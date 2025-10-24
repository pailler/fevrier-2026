# 📊 Guide de Monitoring des Performances Cloudflare

## 🎯 **Métriques Clés à Surveiller**

### **1. Temps de Réponse (Response Time)**
- **Objectif**: < 200ms pour les pages statiques
- **Objectif**: < 500ms pour les pages dynamiques
- **Où surveiller**: Cloudflare Analytics > Performance

### **2. Core Web Vitals**
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8s
- **TTI (Time to Interactive)**: < 3.8s

### **3. Métriques Cloudflare**
- **Cache Hit Ratio**: > 80%
- **Bandwidth Saved**: Surveiller l'économie
- **Requests Served**: Volume de trafic
- **Error Rate**: < 1%

## 🔧 **Outils de Monitoring**

### **1. Cloudflare Analytics**
```
URL: https://dash.cloudflare.com/analytics
Métriques importantes:
- Response Time
- Cache Hit Ratio
- Bandwidth Saved
- Error Rate
```

### **2. Google PageSpeed Insights**
```
URL: https://pagespeed.web.dev/
Testez régulièrement:
- https://pagespeed.web.dev/analysis/https-iahome-fr/
- Mobile et Desktop
- Core Web Vitals
```

### **3. WebPageTest**
```
URL: https://www.webpagetest.org/
Configuration:
- Location: Paris, France
- Browser: Chrome
- Connection: Cable
```

### **4. Lighthouse (Chrome DevTools)**
```
1. Ouvrir Chrome DevTools (F12)
2. Onglet "Lighthouse"
3. Sélectionner "Performance"
4. Cliquer "Generate report"
```

## 📈 **Dashboard de Monitoring Personnalisé**

### **Script PowerShell pour Monitoring**
```powershell
# monitoring-performance.ps1
param(
    [string]$CloudflareApiToken = $env:CLOUDFLARE_API_TOKEN,
    [string]$ZoneId = $env:CLOUDFLARE_ZONE_ID
)

# Fonction pour récupérer les métriques Cloudflare
function Get-CloudflareMetrics {
    $headers = @{
        "Authorization" = "Bearer $CloudflareApiToken"
        "Content-Type" = "application/json"
    }
    
    $endDate = (Get-Date).ToString("yyyy-MM-dd")
    $startDate = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
    
    $url = "https://api.cloudflare.com/client/v4/zones/$ZoneId/analytics/dashboard?since=$startDate&until=$endDate"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
        return $response.result
    }
    catch {
        Write-Host "Erreur récupération métriques: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Affichage des métriques
$metrics = Get-CloudflareMetrics
if ($metrics) {
    Write-Host "📊 Métriques Cloudflare (7 derniers jours)" -ForegroundColor Cyan
    Write-Host "Requests: $($metrics.totals.requests)" -ForegroundColor Green
    Write-Host "Bandwidth Saved: $([math]::Round($metrics.totals.bandwidth_saved / 1GB, 2)) GB" -ForegroundColor Green
    Write-Host "Cache Hit Ratio: $([math]::Round($metrics.totals.cached_requests / $metrics.totals.requests * 100, 2))%" -ForegroundColor Green
}
```

## 🚨 **Alertes de Performance**

### **1. Configuration d'Alertes Cloudflare**
```javascript
// Cloudflare Worker pour alertes
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Mesurer le temps de réponse
  const start = Date.now()
  const response = await fetch(request)
  const duration = Date.now() - start
  
  // Alerte si temps de réponse > 2s
  if (duration > 2000) {
    await sendAlert(`Temps de réponse élevé: ${duration}ms pour ${url.pathname}`)
  }
  
  return response
}

async function sendAlert(message) {
  // Envoyer une alerte (webhook, email, etc.)
  console.log(`ALERTE: ${message}`)
}
```

### **2. Script PowerShell pour Alertes**
```powershell
# alerte-performance.ps1
$threshold = 2000  # 2 secondes
$currentTime = Get-Date

# Test de performance
$start = Get-Date
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing
    $duration = (Get-Date) - $start
    $responseTime = $duration.TotalMilliseconds
    
    if ($responseTime -gt $threshold) {
        Write-Host "🚨 ALERTE: Temps de réponse élevé: $([math]::Round($responseTime, 2))ms" -ForegroundColor Red
        # Ici vous pouvez ajouter l'envoi d'email ou webhook
    } else {
        Write-Host "✅ Performance OK: $([math]::Round($responseTime, 2))ms" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Erreur test performance: $($_.Exception.Message)" -ForegroundColor Red
}
```

## 📋 **Checklist de Performance**

### **Quotidien**
- [ ] Vérifier les métriques Cloudflare
- [ ] Tester les temps de réponse principaux
- [ ] Vérifier le cache hit ratio

### **Hebdomadaire**
- [ ] Test PageSpeed Insights complet
- [ ] Analyse WebPageTest
- [ ] Vérification des Core Web Vitals
- [ ] Audit Lighthouse

### **Mensuel**
- [ ] Analyse des tendances de performance
- [ ] Optimisation des images et assets
- [ ] Mise à jour des configurations de cache
- [ ] Review des Page Rules

## 🎯 **Objectifs de Performance**

### **Temps de Chargement**
- **Page d'accueil**: < 2s
- **Pages internes**: < 3s
- **API endpoints**: < 500ms
- **Assets statiques**: < 1s

### **Core Web Vitals**
- **LCP**: < 2.5s (Excellent)
- **FID**: < 100ms (Excellent)
- **CLS**: < 0.1 (Excellent)

### **Cache Performance**
- **Cache Hit Ratio**: > 80%
- **Bandwidth Saved**: > 50%
- **Error Rate**: < 1%

## 🔧 **Actions Correctives**

### **Si LCP > 2.5s**
1. Optimiser les images (WebP, compression)
2. Précharger les ressources critiques
3. Optimiser le CSS critique
4. Réduire le JavaScript bloquant

### **Si FID > 100ms**
1. Réduire le JavaScript long
2. Utiliser le code splitting
3. Optimiser les interactions utilisateur
4. Implémenter le lazy loading

### **Si CLS > 0.1**
1. Définir les dimensions des images
2. Éviter les polices non-optimisées
3. Précharger les ressources
4. Utiliser les placeholders

### **Si Cache Hit Ratio < 80%**
1. Vérifier les Page Rules
2. Optimiser les headers de cache
3. Configurer le cache côté application
4. Utiliser les CDN optimisations


