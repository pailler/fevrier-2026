# 🔄 Comment Renommer un Worker Cloudflare

## 📍 Méthode 1 : Via l'Onglet "Paramètres" (Settings)

### Étapes :

1. **Sur la page de votre Worker**, regardez les **onglets en haut** :
   - Vue d'ensemble
   - Mesures
   - Déploiements
   - Liaisons
   - Observability
   - **⚙️ Paramètres** ← **Cliquez ici**

2. **Dans l'onglet "Paramètres"**, cherchez la section :
   - **"Nom du Worker"** ou **"Worker name"**
   - Vous verrez probablement un champ de texte avec le nom actuel (ex: `orange-art-165d`)

3. **Modifiez le nom** :
   - Cliquez dans le champ
   - Entrez le nouveau nom : `protect-librespeed`
   - **Cliquez sur "Enregistrer"** ou **"Save"**

---

## 📍 Méthode 2 : Via l'Éditeur de Code

### Étapes :

1. **Sur la page de votre Worker**, cliquez sur :
   - **"</> Modifier le code"** (Modify the code) en haut à droite

2. **Dans l'éditeur qui s'ouvre**, regardez en haut à gauche :
   - Il y a généralement un champ avec le nom du Worker
   - Ou un menu déroulant avec "..." (trois points)

3. **Cliquez sur les "..."** (trois points) à côté du nom du Worker :
   - Sélectionnez **"Renommer"** ou **"Rename"**
   - Entrez le nouveau nom : `protect-librespeed`
   - Confirmez

---

## 📍 Méthode 3 : Via la Liste des Workers

### Étapes :

1. **Retournez à la liste des Workers** :
   - Cliquez sur **"Workers & Pages"** dans le menu latéral gauche
   - Ou utilisez le fil d'Ariane en haut

2. **Dans la liste des Workers**, trouvez votre Worker actuel

3. **Cliquez sur les "..."** (trois points) à droite du nom du Worker :
   - Sélectionnez **"Renommer"** ou **"Rename"**
   - Entrez le nouveau nom : `protect-librespeed`
   - Confirmez

---

## ⚠️ Important Après le Renommage

### 1. L'URL du Worker change

Après le renommage, l'URL du Worker change :
- **Ancienne URL** : `orange-art-165d.regispailler.workers.dev`
- **Nouvelle URL** : `protect-librespeed.regispailler.workers.dev`

### 2. Les Routes RESTENT configurées

**Bonne nouvelle** : Les routes configurées (comme `librespeed.iahome.fr/*`) **restent actives** après le renommage. Vous n'avez pas besoin de les reconfigurer.

### 3. Redéploiement possible

Dans certains cas, vous devrez peut-être **redéployer** le Worker :
- Allez dans l'onglet **"Déploiements"** (Deployments)
- Cliquez sur **"Redéployer"** si nécessaire

---

## 🎯 Nom Recommandé

Pour ce projet, nous recommandons :
```
protect-librespeed
```

Ce nom est :
- ✅ Clair et descriptif
- ✅ Court et facile à retenir
- ✅ Indique la fonction (protéger LibreSpeed)

---

## 📋 Vérification Après Renommage

### 1. Vérifier le nouveau nom

1. Retournez à la liste des Workers
2. Vérifiez que le Worker apparaît avec le nouveau nom

### 2. Vérifier que les routes fonctionnent

1. Testez l'accès direct à `librespeed.iahome.fr` :
   - Devrait rediriger vers `https://iahome.fr/encours?error=direct_access_denied`

2. Testez l'accès avec un token :
   - Devrait fonctionner normalement

### 3. Script de test

```powershell
.\test-cloudflare-worker.ps1
```

---

## 🔧 Si le Renommage Ne Fonctionne Pas

### Vérifications :

1. **Vérifiez les permissions** :
   - Assurez-vous d'avoir les droits d'administration sur le compte Cloudflare

2. **Vérifiez que le nom est disponible** :
   - Le nom ne doit pas contenir de caractères spéciaux (sauf `-` et `_`)
   - Le nom ne doit pas dépasser 63 caractères
   - Le nom ne doit pas être déjà utilisé par un autre Worker dans votre compte

3. **Essayez une autre méthode** :
   - Si une méthode ne fonctionne pas, essayez les autres méthodes décrites ci-dessus

---

## 💡 Astuce

Si vous avez plusieurs Workers et que vous voulez les organiser :
- Utilisez des noms cohérents : `protect-[nom-application]`
- Exemples :
  - `protect-librespeed`
  - `protect-metube`
  - `protect-pdf`

---

**Besoin d'aide ?** Dites-moi quelle méthode vous avez essayée et je vous aiderai à résoudre le problème.

