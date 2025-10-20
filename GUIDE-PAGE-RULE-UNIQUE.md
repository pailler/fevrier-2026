# Guide : Page Rule unique pour bloquer tous les sous-domaines

## 🎯 Objectif
Créer **UNE SEULE** Page Rule Cloudflare qui bloque tous les sous-domaines `*.iahome.fr` en les redirigeant vers `https://iahome.fr/encours`.

## 📋 Étapes à suivre

### 1. Accéder à Cloudflare Dashboard
1. Aller sur [dash.cloudflare.com](https://dash.cloudflare.com)
2. Se connecter avec votre compte Cloudflare
3. Sélectionner le domaine **`iahome.fr`**

### 2. Naviguer vers les Page Rules
1. Dans le menu de gauche, cliquer sur **"Rules"**
2. Cliquer sur **"Page Rules"**
3. Cliquer sur **"Create Page Rule"**

### 3. Configurer la Page Rule unique

#### **URL Pattern :**
```
*.iahome.fr/*
```

#### **Settings :**
1. Cliquer sur **"Add a setting"**
2. Sélectionner **"Forwarding URL"**
3. Configurer :
   - **Status Code :** `302 - Temporary Redirect`
   - **Destination URL :** `https://iahome.fr/encours`

#### **Priority :**
- Laisser la priorité par défaut (1 - la plus haute)

### 4. Activer et sauvegarder
1. Cliquer sur **"Save and Deploy"**
2. Confirmer la création de la Page Rule

## ✅ Résultat attendu

Cette **UNE SEULE** Page Rule va :

- ✅ Bloquer **TOUS** les sous-domaines `*.iahome.fr`
- ✅ Rediriger vers `https://iahome.fr/encours` (302)
- ✅ Protéger automatiquement tous les futurs sous-domaines
- ✅ Utiliser seulement **1 Page Rule** (gratuit)

## 🔒 Sous-domaines protégés automatiquement

- `librespeed.iahome.fr` → Redirection vers `iahome.fr/encours`
- `meeting-reports.iahome.fr` → Redirection vers `iahome.fr/encours`
- `whisper.iahome.fr` → Redirection vers `iahome.fr/encours`
- `comfyui.iahome.fr` → Redirection vers `iahome.fr/encours`
- `stablediffusion.iahome.fr` → Redirection vers `iahome.fr/encours`
- `qrcodes.iahome.fr` → Redirection vers `iahome.fr/encours`
- `psitransfer.iahome.fr` → Redirection vers `iahome.fr/encours`
- `metube.iahome.fr` → Redirection vers `iahome.fr/encours`
- `pdf.iahome.fr` → Redirection vers `iahome.fr/encours`
- **ET TOUS LES AUTRES** sous-domaines `*.iahome.fr`

## ⏱️ Délai d'activation

La Page Rule peut prendre **2-3 minutes** pour être active sur tous les serveurs Cloudflare.

## 🧪 Test de la protection

1. Attendre 2-3 minutes après la création
2. Tester : `https://librespeed.iahome.fr`
3. **Résultat attendu :** Redirection automatique vers `https://iahome.fr/encours`

## 💡 Avantages de cette solution

- ✅ **Gratuite** (utilise seulement 1 Page Rule)
- ✅ **Simple** (une seule règle à gérer)
- ✅ **Complète** (protège tous les sous-domaines)
- ✅ **Automatique** (protège les futurs sous-domaines)
- ✅ **Efficace** (redirection immédiate)

## 🔧 Configuration technique

```
Pattern: *.iahome.fr/*
Action: Forwarding URL
Status Code: 302
Destination: https://iahome.fr/encours
Priority: 1
Status: Active
```

Cette solution est **parfaite** pour votre cas d'usage ! 🎯
