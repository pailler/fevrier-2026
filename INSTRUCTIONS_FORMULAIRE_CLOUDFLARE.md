# 📝 Instructions : Remplir le Formulaire Cloudflare Redirect Rules

## 🎯 Remplissage du Formulaire

### 1️⃣ **Nom de la règle (requis)**

Dans le champ **"Nom de la règle (requis)"** :

```
Protect librespeed without token
```

---

### 2️⃣ **Si des requêtes entrantes correspondent...**

Vous avez **3 options** dans cette section. Pour notre cas, nous avons besoin d'une condition spécifique sur le query string, donc :

#### ✅ **Option recommandée : "Expression de filtre personnalisé"**

**Action à faire :**
1. Cliquez sur le bouton radio **"Expression de filtre personnalisé"**
2. Dans le champ qui apparaît, entrez cette expression :

```
(http.host eq "librespeed.iahome.fr" and not http.request.uri.query contains "token")
```

**Explication de l'expression :**
- `http.host eq "librespeed.iahome.fr"` → Condition sur le hostname
- `and` → ET logique
- `not http.request.uri.query contains "token"` → La query string ne contient PAS "token"

#### ⚠️ **Alternative : "Modèle de caractère générique" (si l'expression personnalisée ne fonctionne pas)**

Si l'option "Expression de filtre personnalisé" n'est pas disponible ou ne fonctionne pas :

1. Sélectionnez **"Modèle de caractère générique"**
2. Dans le champ **"URL de requête"**, entrez :

```
https://librespeed.iahome.fr/*
```

**Note :** Cette méthode ne permet PAS de vérifier si la query string contient "token". Dans ce cas, la redirection s'appliquera à toutes les requêtes, même avec token. La vérification du token devra être faite côté Next.js uniquement.

---

### 3️⃣ **Alors...**

#### **URL cible**

Dans le champ **"URL cible"** :

```
https://iahome.fr/api/librespeed-redirect
```

#### **Code de statut**

Dans le menu déroulant **"Code de statut"** :

- Sélectionnez **302** (Redirection temporaire)

---

## 📋 Récapitulatif des Valeurs à Entrer

| Champ | Valeur |
|-------|--------|
| **Nom de la règle** | `Protect librespeed without token` |
| **Type de correspondance** | `Expression de filtre personnalisé` |
| **Expression** | `(http.host eq "librespeed.iahome.fr" and not http.request.uri.query contains "token")` |
| **URL cible** | `https://iahome.fr/api/librespeed-redirect` |
| **Code de statut** | `302` |

---

## ✅ Après le Remplissage

1. **Vérifiez** que tous les champs sont remplis correctement
2. Cliquez sur le bouton **"Créer"** ou **"Deploy"** (selon l'interface)
3. La règle sera immédiatement active

---

## 🧪 Test Immédiat

Après la création, testez avec :

```powershell
# Test sans token (doit rediriger)
curl -I https://librespeed.iahome.fr

# Test avec token (ne doit PAS rediriger)
curl -I "https://librespeed.iahome.fr?token=test123"
```

Ou utilisez le script :
```powershell
.\test-redirect-rules.ps1
```

---

## ⚠️ Si l'Expression Personnalisée ne Fonctionne Pas

Si vous ne pouvez pas utiliser "Expression de filtre personnalisé", utilisez "Modèle de caractère générique" avec :

- **URL de requête** : `https://librespeed.iahome.fr/*`
- **URL cible** : `https://iahome.fr/api/librespeed-redirect`
- **Code de statut** : `302`

Dans ce cas, **toutes** les requêtes vers `librespeed.iahome.fr` seront redirigées, même avec token. La vérification du token sera faite uniquement par Next.js dans `/api/librespeed-redirect`.


