# 🛡️ Guide de Protection des Sous-domaines - Solution Finale

## 🎯 **Objectif**
Protéger tous les sous-domaines en les redirigeant vers l'application Next.js qui gère l'authentification et l'autorisation.

## 🔧 **Solution : Page Rules Cloudflare**

### **Étape 1 : Aller dans Page Rules**
1. **Connectez-vous à Cloudflare** : https://dash.cloudflare.com
2. **Sélectionnez votre domaine** : `iahome.fr`
3. **Allez dans "Rules" → "Page Rules"**

### **Étape 2 : Créer une Page Rule**
1. **Cliquez sur "Create Page Rule"**
2. **URL Pattern** : `*.iahome.fr/*`
3. **Settings** :
   - **Forwarding URL** : `https://iahome.fr/subdomain-protection`
   - **Status Code** : `302 (Temporary Redirect)`

### **Étape 3 : Exclure le domaine principal**
1. **Créer une autre Page Rule** pour `iahome.fr`
2. **URL Pattern** : `iahome.fr/*`
3. **Settings** :
   - **Cache Level** : `Bypass`
   - **Browser Cache TTL** : `Respect Existing Headers`

### **Étape 4 : Exclure www**
1. **Créer une autre Page Rule** pour `www.iahome.fr`
2. **URL Pattern** : `www.iahome.fr/*`
3. **Settings** :
   - **Cache Level** : `Bypass`
   - **Browser Cache TTL** : `Respect Existing Headers`

## 📋 **Configuration des Page Rules**

### **Page Rule 1 : Protection des sous-domaines**
```
URL Pattern: *.iahome.fr/*
Settings:
  - Forwarding URL: https://iahome.fr/subdomain-protection
  - Status Code: 302 (Temporary Redirect)
```

### **Page Rule 2 : Domaine principal (exclusion)**
```
URL Pattern: iahome.fr/*
Settings:
  - Cache Level: Bypass
  - Browser Cache TTL: Respect Existing Headers
```

### **Page Rule 3 : www (exclusion)**
```
URL Pattern: www.iahome.fr/*
Settings:
  - Cache Level: Bypass
  - Browser Cache TTL: Respect Existing Headers
```

## 🎯 **Résultat attendu**

### **✅ Accès autorisé :**
- `https://iahome.fr` → Application Next.js normale
- `https://www.iahome.fr` → Application Next.js normale
- `https://librespeed.iahome.fr?token=abc123` → Application Next.js avec token

### **🔒 Accès bloqué :**
- `https://librespeed.iahome.fr` → Redirection vers page de protection
- `https://meeting-reports.iahome.fr` → Redirection vers page de protection
- `https://whisper.iahome.fr` → Redirection vers page de protection

## 🔧 **Alternative : Configuration du tunnel local**

Si les Page Rules ne fonctionnent pas, vous pouvez modifier le fichier `cloudflare-tunnel-config.yml` :

```yaml
tunnel: iahome-new
credentials-file: /root/.cloudflared/iahome-new.json

ingress:
  # Domaine principal - application Next.js
  - hostname: iahome.fr
    service: http://localhost:3000
    originRequest:
      httpHostHeader: iahome.fr
      disableChunkedEncoding: true
      keepAliveConnections: 10
      noTLSVerify: true

  - hostname: www.iahome.fr
    service: http://localhost:3000
    originRequest:
      httpHostHeader: www.iahome.fr
      disableChunkedEncoding: true
      keepAliveConnections: 10
      noTLSVerify: true

  # Tous les sous-domaines pointent vers Next.js pour la protection
  - hostname: "*.iahome.fr"
    service: http://localhost:3000
    originRequest:
      httpHostHeader: "*.iahome.fr"
      disableChunkedEncoding: true
      keepAliveConnections: 10
      noTLSVerify: true

  # Règle par défaut
  - service: http_status:404
```

## 🚀 **Test de la protection**

1. **Testez l'accès direct** : `https://librespeed.iahome.fr`
   - **Attendu** : Redirection vers page de protection

2. **Testez l'accès avec token** : `https://librespeed.iahome.fr?token=abc123`
   - **Attendu** : Redirection vers page d'accès avec token

3. **Testez le domaine principal** : `https://iahome.fr`
   - **Attendu** : Application Next.js normale

## 🎉 **Avantages de cette solution**

- ✅ **Gratuite** - Utilise les Page Rules Cloudflare (gratuites)
- ✅ **Simple** - Configuration via l'interface Cloudflare
- ✅ **Efficace** - Protection au niveau DNS/Edge
- ✅ **Flexible** - Peut être modifiée facilement
- ✅ **Sécurisée** - Tous les accès passent par l'application Next.js

## 🔧 **Dépannage**

### **Problème : La redirection ne fonctionne pas**
- Vérifiez que les Page Rules sont actives
- Vérifiez l'ordre des règles (les plus spécifiques en premier)
- Attendez quelques minutes pour la propagation

### **Problème : L'application Next.js ne charge pas**
- Vérifiez que l'application Next.js est en cours d'exécution sur le port 3000
- Vérifiez que le tunnel Cloudflare est connecté
- Vérifiez les logs du tunnel

### **Problème : Les tokens ne fonctionnent pas**
- Vérifiez que la logique de protection est implémentée dans `src/app/page.tsx`
- Vérifiez que la page `/subdomain-protection` existe
- Vérifiez que la page `/access/[token]` existe
