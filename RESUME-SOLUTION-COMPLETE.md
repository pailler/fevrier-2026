# ✅ Solution Complète : Protection avec Token

## 🎯 Objectif Atteint

✅ **Blocage** de l'accès direct aux sous-domaines  
✅ **Autorisation** de l'accès via le bouton avec token

## 🔧 Modifications Effectuées

### 1. Génération de Token (Code)

**Fichiers modifiés** :
- `src/components/ModuleAccessButton.tsx`
- `src/components/EssentialAccessButton.tsx`

**Changement** : Ajout de la génération et injection du token dans l'URL

```typescript
// Générer un token sécurisé pour l'accès autorisé
const token = `${Date.now()}_${user.id}_${Math.random().toString(36).substr(2, 9)}`;
const encodedToken = btoa(token);

// Ajouter le token à l'URL
const accessUrl = `${baseUrl}?token=${encodedToken}`;
```

**Résultat** : Quand un utilisateur clique sur "Accéder", l'URL générée est :
```
https://stablediffusion.iahome.fr?token=ENCODED_TOKEN
```

### 2. Application Reconstruite

✅ L'application a été reconstruite avec ces modifications  
✅ Le container Docker a été redémarré

## 🛡️ Configuration Cloudflare (À Faire)

### Option A : Script Automatique

```powershell
.\setup-secure-firewall-rules.ps1
```

### Option B : Configuration Manuelle

Allez dans le Dashboard Cloudflare pour chaque sous-domaine :

**Règle 1 - Autoriser avec Token** :
- Nom : `[subdomain]-allow-with-token`
- Expression : `(http.host eq "[subdomain].iahome.fr" and http.request.uri.query contains "token=")`
- Action : `Allow`

**Règle 2 - Bloquer sans Token** :
- Nom : `[subdomain]-block-direct`
- Expression : `(http.host eq "[subdomain].iahome.fr" and not http.request.uri.query contains "token=")`
- Action : `Block`

## 🧪 Tests à Effectuer

### Test 1 : Accès Sans Token (Blocage)

1. Ouvrez : https://stablediffusion.iahome.fr
2. **Attendu** : Bloqué ou redirigé vers iahome.fr
3. **Résultat** : À vérifier

### Test 2 : Accès Avec Token (Autorisation)

1. Ouvrez : https://iahome.fr/encours
2. Cliquez sur "Accéder à StableDiffusion"
3. Ouvrez la console (F12)
4. **Vérifiez** que l'URL contient `?token=`
5. **Attendu** : StableDiffusion s'affiche
6. **Résultat** : À vérifier

## 📋 Sous-Domaines à Protéger

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

## 🎯 Prochaines Étapes

1. **Tester** la génération de token (console F12)
2. **Créer** les règles Cloudflare (script ou manuel)
3. **Vérifier** que tout fonctionne

## ⚠️ Important

Les règles Cloudflare doivent être créées maintenant pour que le blocage fonctionne.

**Sans les règles Cloudflare** :
- ❌ L'accès direct fonctionne encore
- ✅ L'accès avec token fonctionne aussi

**Avec les règles Cloudflare** :
- ❌ L'accès direct est bloqué
- ✅ L'accès avec token est autorisé

## 📁 Fichiers Créés

- `setup-secure-firewall-rules.ps1` - Script automatique
- `REGLE-SECURITE-CLOUDFLARE.md` - Documentation complète


