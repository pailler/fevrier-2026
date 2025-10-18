# 🔒 Guide de sécurisation LibreSpeed avec Cloudflare

## 📋 Prérequis

1. **Compte Cloudflare** avec votre domaine `iahome.fr`
2. **Clés API Cloudflare** :
   - Token API (avec permissions Zone:Read, Zone:Edit, Account:Read)
   - Zone ID de `iahome.fr`
   - Account ID

## 🚀 Installation rapide

### 1. Obtenir vos clés Cloudflare

#### Token API :
1. Allez sur https://dash.cloudflare.com/profile/api-tokens
2. Cliquez sur "Create Token"
3. Utilisez le template "Custom token"
4. Permissions :
   - `Zone:Zone:Read`
   - `Zone:Zone:Edit`
   - `Account:Account:Read`
   - `Zone:Zone Settings:Edit`
5. Zone Resources : `Include: All zones`
6. Account Resources : `Include: All accounts`

#### Zone ID :
1. Allez sur https://dash.cloudflare.com
2. Sélectionnez votre domaine `iahome.fr`
3. Copiez le "Zone ID" (en bas à droite)

#### Account ID :
1. Dans le même écran, copiez l'ID de compte (sous Zone ID)

### 2. Configuration

1. **Modifiez le fichier `cloudflare-config.ps1`** :
```powershell
$CloudflareApiToken = "VOTRE_VRAI_TOKEN_ICI"
$ZoneId = "VOTRE_VRAI_ZONE_ID_ICI"
$AccountId = "VOTRE_VRAI_ACCOUNT_ID_ICI"
```

2. **Exécutez la configuration** :
```powershell
.\cloudflare-config.ps1
```

## 🔧 Configuration manuelle (optionnel)

Si vous préférez configurer manuellement :

### 1. Sécurité de base
```powershell
.\secure-librespeed-cloudflare.ps1 -CloudflareApiToken "VOTRE_TOKEN" -ZoneId "VOTRE_ZONE_ID"
```

### 2. Cloudflare Access (Zero Trust)
```powershell
.\configure-librespeed-access.ps1 -CloudflareApiToken "VOTRE_TOKEN" -AccountId "VOTRE_ACCOUNT_ID"
```

## 🛡️ Fonctionnalités de sécurité configurées

### ✅ Protection WAF
- **Anti-bots** : Blocage automatique des bots malveillants
- **Rate limiting** : Limitation à 100 requêtes/10 minutes
- **Protection DDoS** : Protection contre les attaques DDoS

### ✅ SSL/TLS
- **Mode strict** : Chiffrement end-to-end
- **TLS 1.3** : Protocole de chiffrement le plus récent
- **HSTS** : Protection contre les attaques de downgrade

### ✅ Headers de sécurité
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### ✅ Cloudflare Access (Zero Trust)
- **Authentification par email** : Seuls les emails `@iahome.fr` peuvent accéder
- **Session 24h** : Authentification valide 24 heures
- **Headers d'identité** : Transmission de l'email utilisateur à l'application

## 📊 Monitoring

### Dashboard Cloudflare
- **Analytics** : https://dash.cloudflare.com/analytics
- **Security** : https://dash.cloudflare.com/security
- **Zero Trust** : https://one.dash.cloudflare.com/access

### Logs en temps réel
- **WAF Events** : Security > Events
- **Access Logs** : Zero Trust > Access > Logs
- **Analytics** : Analytics > Web Analytics

## 🔍 Tests de sécurité

### Test d'accès
```powershell
curl -I https://librespeed.iahome.fr
```

### Test des headers de sécurité
```powershell
curl -I https://librespeed.iahome.fr | findstr "X-"
```

### Test de protection anti-bot
```powershell
curl -H "User-Agent: bot" https://librespeed.iahome.fr
```

## 🚨 Dépannage

### LibreSpeed inaccessible
1. Vérifiez que LibreSpeed est démarré :
```powershell
docker ps --filter name=librespeed
```

2. Vérifiez le tunnel Cloudflare :
```powershell
Get-Process -Name "cloudflared"
```

3. Vérifiez la configuration DNS :
```powershell
nslookup librespeed.iahome.fr
```

### Erreur d'authentification
1. Vérifiez que votre email est `@iahome.fr`
2. Vérifiez la configuration Cloudflare Access
3. Vérifiez les logs dans le dashboard Cloudflare

### Erreur de configuration API
1. Vérifiez que votre token API a les bonnes permissions
2. Vérifiez que le Zone ID et Account ID sont corrects
3. Vérifiez que votre domaine est bien configuré dans Cloudflare

## 💰 Coûts

### Cloudflare Free (recommandé)
- ✅ Tunnel Cloudflare : Gratuit
- ✅ WAF de base : Gratuit
- ✅ SSL/TLS : Gratuit
- ✅ Headers de sécurité : Gratuit
- ✅ Protection DDoS : Gratuit
- ✅ Bot Management : Gratuit
- ✅ Cloudflare Access : Gratuit (jusqu'à 50 utilisateurs)

### Cloudflare Pro (optionnel)
- 💰 20$/mois
- ✅ WAF avancé
- ✅ Analytics avancés
- ✅ Support prioritaire

## 📞 Support

- **Documentation Cloudflare** : https://developers.cloudflare.com/
- **Support Cloudflare** : https://support.cloudflare.com/
- **Community** : https://community.cloudflare.com/

## 🎯 Résultat final

Après configuration, vous aurez :
- 🌐 LibreSpeed accessible via https://librespeed.iahome.fr
- 🔐 Authentification par email @iahome.fr
- 🛡️ Protection complète contre les attaques
- 📊 Monitoring en temps réel
- ⚡ Performance optimisée par Cloudflare CDN
- 🔒 Sécurité de niveau entreprise

---

**🎉 Félicitations ! Votre LibreSpeed est maintenant sécurisé avec Cloudflare !**

