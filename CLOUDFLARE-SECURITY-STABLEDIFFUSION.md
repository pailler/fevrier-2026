# 🔒 Configuration Cloudflare pour sécuriser stablediffusion.iahome.fr

## 📍 Accès à la configuration
Page Cloudflare : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/security/security-rules

## 🛡️ Règles de sécurité recommandées

### 1️⃣ **Rate Limiting - Protection contre les attaques DDoS**

**Chemin** : Security → WAF → Rate limiting rules

**Règle 1 : Protection globale par IP**
```
Nom : stablediffusion-global-rate-limit
Action : Block
Expression : (http.host eq "stablediffusion.iahome.fr")
Rate : 100 requêtes par minute par IP
```
**Description** : Limite le nombre de requêtes par IP pour éviter les abus

**Règle 2 : Protection contre les attaques volumétriques**
```
Nom : stablediffusion-volume-attack
Action : Challenge
Expression : (http.host eq "stablediffusion.iahome.fr") and (cf.threat_score gt 10)
Rate : 20 requêtes par minute par IP
```
**Description** : Met en place un challenge CAPTCHA pour les IPs suspectes

---

### 2️⃣ **Firewall Rules - Restrictions d'accès**

**Chemin** : Security → WAF → Firewall rules

**Règle 1 : Autoriser uniquement les méthodes HTTP autorisées**
```
Nom : stablediffusion-methods
Action : Block
Expression : (http.host eq "stablediffusion.iahome.fr") and not (http.request.method in {"GET" "POST" "OPTIONS"})
```
**Description** : Bloque toutes les méthodes HTTP sauf GET, POST et OPTIONS

**Règle 2 : Bloquer les User-Agents suspects**
```
Nom : stablediffusion-suspicious-agents
Action : Block
Expression : (http.host eq "stablediffusion.iahome.fr") and (http.user_agent contains "curl" or http.user_agent contains "wget" or http.user_agent contains "python")
```
**Description** : Bloque les user-agents automatisés (ajustez selon vos besoins)

**Règle 3 : Protection contre les headers malveillants**
```
Nom : stablediffusion-malicious-headers
Action : Block
Expression : (http.host eq "stablediffusion.iahome.fr") and (http.request.headers["x-forwarded-for"][*] ne "YOUR_IP" and not (ip.src in {YOUR_IP}))
```
**Description** : Protège contre les headers malveillants (remplacez YOUR_IP par votre IP)

**Règle 4 : Autoriser uniquement certains pays**
```
Nom : stablediffusion-allowed-countries
Action : Block
Expression : (http.host eq "stablediffusion.iahome.fr") and (ip.geoip.country ne "FR" and ip.geoip.country ne "US" and ip.geoip.country ne "BE" and ip.geoip.country ne "CH")
```
**Description** : Autorise uniquement la France, USA, Belgique et Suisse (ajustez selon vos besoins)

**Règle 5 : Protection CSRF**
```
Nom : stablediffusion-csrf-protection
Action : Challenge
Expression : (http.host eq "stablediffusion.iahome.fr") and (http.request.method eq "POST") and not (http.request.headers["origin"][*] contains "iahome.fr")
```
**Description** : Vérifie l'origine des requêtes POST pour prévenir les attaques CSRF

---

### 3️⃣ **WAF Custom Rules - Protection avancée**

**Chemin** : Security → WAF → Custom rules

**Règle 1 : Protection contre les injections SQL**
```
Nom : stablediffusion-sql-injection
Action : Block
Expression : (http.host eq "stablediffusion.iahome.fr") and (
  http.request.body.truncated contains "';" or
  http.request.body.truncated contains "UNION" or
  http.request.body.truncated contains "SELECT" or
  http.request.body.truncated contains "DROP" or
  http.request.uri.query contains "';" or
  http.request.uri.query contains "UNION" or
  http.request.uri.query contains "SELECT" or
  http.request.uri.query contains "DROP"
)
```
**Description** : Détecte et bloque les tentatives d'injection SQL

**Règle 2 : Protection contre XSS (Cross-Site Scripting)**
```
Nom : stablediffusion-xss
Action : Block
Expression : (http.host eq "stablediffusion.iahome.fr") and (
  http.request.body.truncated contains "<script" or
  http.request.body.truncated contains "javascript:" or
  http.request.uri.query contains "<script" or
  http.request.uri.query contains "javascript:"
)
```
**Description** : Détecte et bloque les tentatives d'injection XSS

**Règle 3 : Protection contre les path traversals**
```
Nom : stablediffusion-path-traversal
Action : Block
Expression : (http.host eq "stablediffusion.iahome.fr") and (
  http.request.uri.path contains "../" or
  http.request.uri.path contains "..\\" or
  http.request.uri.path contains "/etc/passwd" or
  http.request.uri.path contains "/etc/shadow"
)
```
**Description** : Bloque les tentatives d'accès à des fichiers système

---

### 4️⃣ **Transform Rules - Headers de sécurité**

**Chemin** : Rules → Transform Rules → Modify Request Header

**Règle 1 : Ajouter les headers de sécurité**
```
Nom : stablediffusion-security-headers
Condition : (http.host eq "stablediffusion.iahome.fr")
Actions :
  - Set header "X-Content-Type-Options" to "nosniff"
  - Set header "X-Frame-Options" to "DENY"
  - Set header "X-XSS-Protection" to "1; mode=block"
  - Set header "Referrer-Policy" to "strict-origin-when-cross-origin"
  - Set header "Permissions-Policy" to "geolocation=(), microphone=(), camera=()"
```

---

### 5️⃣ **Page Rules - Cache et Performance**

**Chemin** : Rules → Page Rules

**Règle 1 : Cache des assets statiques**
```
URL : stablediffusion.iahome.fr/static/*
Settings :
  - Cache Level : Cache Everything
  - Edge Cache TTL : 1 month
```

**Règle 2 : Pas de cache pour l'API**
```
URL : stablediffusion.iahome.fr/api/*
Settings :
  - Cache Level : Bypass
```

---

### 6️⃣ **Authentification par zone (optionnel)**

Si vous souhaitez une protection par authentification supplémentaire :

**Chemin** : Zero Trust → Access → Applications

**Règle d'accès pour stablediffusion.iahome.fr**
```
Name : stablediffusion-secure-access
Application : stablediffusion.iahome.fr
Policy :
  - Require authentication via Cloudflare Access
  - Bypass for: Votre IP (optionnel)
  - Session duration : 24 hours
```

---

## 🔧 Configuration actuelle du tunnel

D'après votre configuration Cloudflare :

```yaml
# stablediffusion.iahome.fr
- hostname: stablediffusion.iahome.fr
  service: http://192.168.1.150:7880
  originRequest:
    httpHostHeader: stablediffusion.iahome.fr
    noTLSVerify: true
```

Le service backend est accessible sur `http://192.168.1.150:7880`

---

## 📊 Ordre de priorité des règles

1. **Rate Limiting** (1ère ligne de défense)
2. **Firewall Rules** (Filtrage basique)
3. **WAF Custom Rules** (Protection avancée)
4. **Transform Rules** (Sécurisation des headers)
5. **Page Rules** (Optimisation)

---

## ⚠️ Notes importantes

- **Testez chaque règle** avant de la mettre en production
- **Surveillez les faux positifs** dans les logs
- **Ajustez les taux** selon votre trafic réel
- **Sauvegardez** la configuration avant les modifications
- **Documentez** les changements effectués

---

## 🚀 Mise en place

1. Connectez-vous à https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr
2. Allez dans **Security → WAF**
3. Créez les règles dans l'ordre ci-dessus
4. Testez l'accès à https://stablediffusion.iahome.fr/
5. Surveillez les logs pour détecter les tentatives d'attaque

