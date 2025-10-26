# 🛡️ Règles de Sécurité Cloudflare pour Tous les Sous-Domaines

## 📋 Objectif

**Bloquer** l'accès direct aux sous-domaines  
**Autoriser** l'accès via le bouton avec token

## 🎯 Sous-Domaines Protégés

- `librespeed.iahome.fr`
- `meeting-reports.iahome.fr`
- `whisper.iahome.fr`
- `comfyui.iahome.fr`
- `stablediffusion.iahome.fr`
- `qrcodes.iahome.fr`
- `psitransfer.iahome.fr`
- `metube.iahome.fr`
- `pdf.iahome.fr`
- `ruinedfooocus.iahome.fr`
- `cogstudio.iahome.fr`

## 🔧 Installation Automatique

### Via PowerShell

```powershell
.\setup-secure-firewall-rules.ps1
```

## 📝 Installation Manuelle

### 1. Accédez au Dashboard

🌐 https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/security/waf

### 2. Pour Chaque Sous-Domaine

#### RÈGLE 1 : Autoriser avec Token

1. **Cliquez** sur "Create rule"
2. **Nom** : `[subdomain]-allow-with-token`
3. **Expression** :
   ```
   (http.host eq "[subdomain].iahome.fr" and http.request.uri.query contains "token=")
   ```
4. **Action** : `Allow`
5. **Save**

#### RÈGLE 2 : Bloquer sans Token

1. **Cliquez** sur "Create rule"
2. **Nom** : `[subdomain]-block-direct`
3. **Expression** :
   ```
   (http.host eq "[subdomain].iahome.fr" and not http.request.uri.query contains "token=")
   ```
4. **Action** : `Block`
5. **Save**

## 🎯 Exemples d'Expressions

### Pour `stablediffusion.iahome.fr`

**Règle 1 (Allow)** :
```
(http.host eq "stablediffusion.iahome.fr" and http.request.uri.query contains "token=")
```

**Règle 2 (Block)** :
```
(http.host eq "stablediffusion.iahome.fr" and not http.request.uri.query contains "token=")
```

### Pour `librespeed.iahome.fr`

**Règle 1 (Allow)** :
```
(http.host eq "librespeed.iahome.fr" and http.request.uri.query contains "token=")
```

**Règle 2 (Block)** :
```
(http.host eq "librespeed.iahome.fr" and not http.request.uri.query contains "token=")
```

## ⚠️ Ordre d'Évaluation

⚠️ **Important** : Cloudflare évalue les règles dans l'ordre de priorité

**Pour que ça fonctionne correctement** :
1. La règle **Allow** doit avoir une priorité **plus élevée** que la règle **Block**
2. Dans l'interface Cloudflare, vérifiez l'ordre des règles
3. Si besoin, réorganisez les règles

## 🧪 Test

### Test 1 : Accès Sans Token (Devrait Être Bloqué)

1. Ouvrez https://stablediffusion.iahome.fr
2. **Attendu** : Redirection vers iahome.fr ou page bloquée
3. **Si OK** : ✅ Règle de blocage fonctionne

### Test 2 : Accès Avec Token (Devrait Fonctionner)

1. Ouvrez https://iahome.fr/encours
2. Cliquez sur "Accéder à StableDiffusion"
3. Un nouvel onglet s'ouvre
4. **URL affichée** : `https://stablediffusion.iahome.fr?token=XXX`
5. **Attendu** : StableDiffusion s'affiche
6. **Si OK** : ✅ Règle d'autorisation fonctionne

### Test 3 : Vérification Console

1. Ouvrez la console (F12)
2. Cliquez sur le bouton "Accéder"
3. **Vérifiez** le message dans la console :
   ```
   🔗 StableDiffusion: Accès autorisé à: https://stablediffusion.iahome.fr?token=XXX
   ```
4. **Si OK** : ✅ Le token est généré

## 🔄 Reconstruire l'Application

Après avoir modifié les composants :

```powershell
# Reconstruire l'image Docker
docker-compose -f docker-compose.prod.yml build --no-cache

# Redémarrer le container
docker-compose -f docker-compose.prod.yml restart iahome-app

# Attendre 30 secondes
Start-Sleep -Seconds 30
```

## 📊 Résumé

### Ce Qui a Été Modifié

1. ✅ **Génération de token** dans les composants d'accès
2. ✅ **Script PowerShell** pour automatiser la configuration
3. ✅ **Documentation** complète

### Résultat Attendu

- ❌ Accès direct sans token → **Bloqué**
- ✅ Accès via bouton avec token → **Autorisé**

## 🛠️ Dépannage

### Si l'accès direct fonctionne encore

1. Vérifiez que les règles sont **actives** (pas en pause)
2. Vérifiez l'ordre des règles (priorité)
3. Attendez 1-2 minutes pour la propagation

### Si l'accès avec token est bloqué

1. Vérifiez dans la console que le token est généré
2. Vérifiez que l'URL contient `?token=`
3. Reconstruisez l'application

### Si ça ne fonctionne toujours pas

1. Désactivez temporairement toutes les règles
2. Testez si l'accès fonctionne sans protection
3. Si oui, le problème est dans les règles
4. Si non, le problème est ailleurs


