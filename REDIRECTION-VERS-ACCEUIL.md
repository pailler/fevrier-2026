# 🔀 Redirection vers Page d'Accueil

## 🎯 Changement Effectué

**Au lieu de bloquer** → **Rediriger vers https://iahome.fr**

## 📋 Configuration Cloudflare

### RÈGLE 1 : Autoriser avec Token (Identique)

**Expression** :
```
(http.host eq "stablediffusion.iahome.fr" and http.request.uri.query contains "token=")
```

**Action** : `Allow`

### RÈGLE 2 : Rediriger sans Token (Modifiée)

**Expression** :
```
(http.host eq "stablediffusion.iahome.fr" and not http.request.uri.query contains "token=")
```

**Action** : `Redirect`

**URL de redirection** : `https://iahome.fr`

## 🔧 Installation

### Via Script

```powershell
.\setup-secure-firewall-rules.ps1
```

### Manuelle

1. **Dashboard Cloudflare** : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/iahome.fr/security/waf
2. **Créer Règle 1** : Allow avec token
3. **Créer Règle 2** : Redirect vers iahome.fr

## 🧪 Résultat Attendu

### Sans Token
1. Utilisateur va sur https://stablediffusion.iahome.fr
2. **Redirection automatique** vers https://iahome.fr
3. ✅ L'utilisateur est sur la page d'accueil

### Avec Token
1. Utilisateur clique sur bouton "Accéder"
2. URL : https://stablediffusion.iahome.fr?token=XXX
3. **StableDiffusion s'affiche**
4. ✅ L'utilisateur accède à l'application

## ⚠️ Différence avec "Block"

**Avec "Block"** :
- Page blanche ou message "Access Denied"
- Expérience utilisateur négative

**Avec "Redirect"** :
- Redirection automatique vers iahome.fr
- L'utilisateur peut se connecter et accéder normalement
- Expérience utilisateur positive

## 📝 Pour Tous les Sous-Domaines

Appliquer la même logique pour :
- librespeed.iahome.fr
- meeting-reports.iahome.fr
- whisper.iahome.fr
- comfyui.iahome.fr
- qrcodes.iahome.fr
- psitransfer.iahome.fr
- metube.iahome.fr
- pdf.iahome.fr
- ruinedfooocus.iahome.fr
- cogstudio.iahome.fr


