# 🚀 Configuration Rapide : Redirect Rules Cloudflare

## ⚡ Méthode Automatique (Recommandée)

### Étape 1: Obtenir votre API Token Cloudflare

1. Allez sur : https://dash.cloudflare.com/profile/api-tokens
2. Cliquez sur **Create Token**
3. Utilisez le template **Edit zone DNS** ou créez un token personnalisé avec :
   - **Permissions** :
     - Zone → Zone Settings → Read
     - Zone → Zone Rules → Edit
   - **Zone Resources** : Include → Specific zone → `iahome.fr`
4. Copiez le token

### Étape 2: Exécuter le script automatique

```powershell
# Définir votre API Token
$env:CLOUDFLARE_API_TOKEN = "votre-token-ici"

# Exécuter le script
.\create-cloudflare-redirect-rule.ps1
```

Le script va :
- ✅ Récupérer automatiquement le Zone ID
- ✅ Créer la Redirect Rule
- ✅ Vérifier la configuration

---

## 🖱️ Méthode Manuelle (Alternative)

Si l'API ne fonctionne pas ou si vous préférez configurer manuellement :

### Étape 1: Ouvrir Cloudflare Dashboard

1. Connectez-vous à : https://dash.cloudflare.com/
2. Sélectionnez votre domaine : **iahome.fr**

### Étape 2: Accéder à Redirect Rules

1. Dans le menu de gauche, cliquez sur **Rules**
2. Cliquez sur **Redirect Rules**

### Étape 3: Créer la Règle

1. Cliquez sur **Create rule** (ou **Créer une règle**)

### Étape 4: Configurer la Règle

#### Rule name (Nom de la règle)
```
Protect librespeed without token
```

#### When incoming requests match (Quand les requêtes entrantes correspondent)

**Condition 1** :
- **Field** (Champ) : `Hostname`
- **Operator** (Opérateur) : `equals`
- **Value** (Valeur) : `librespeed.iahome.fr`

**Condition 2** (cliquez sur **Add condition** / **Ajouter une condition**) :
- **Field** (Champ) : `Query String`
- **Operator** (Opérateur) : `does not contain`
- **Value** (Valeur) : `token`

#### Then the settings are (Alors les paramètres sont)

- **Action** : `Dynamic redirect`
- **Status code** : `302 - Temporary Redirect`
- **Redirect to** : `https://iahome.fr/api/librespeed-redirect`

### Étape 5: Déployer

1. Cliquez sur **Deploy** (ou **Déployer**)
2. La règle sera active immédiatement

---

## ✅ Vérification

### Test 1: Accès Direct Sans Token

```powershell
curl -I https://librespeed.iahome.fr
```

**Résultat attendu** : Redirection 302 vers `https://iahome.fr/api/librespeed-redirect`

### Test 2: Accès Avec Token

```powershell
curl -I "https://librespeed.iahome.fr?token=test123"
```

**Résultat attendu** : Pas de redirection par Redirect Rules (la requête passe normalement)

### Test Automatique

```powershell
.\test-redirect-rules.ps1
```

---

## 🔧 Dépannage

### Problème : La règle ne fonctionne pas

1. **Vérifier que la règle est active** :
   - Cloudflare Dashboard → Rules → Redirect Rules
   - Vérifier que la règle a le statut "Active" (pas "Paused")

2. **Vérifier la propagation** :
   - Attendre 2-3 minutes après la création
   - Les règles peuvent prendre quelques minutes à se propager

3. **Vérifier les conditions** :
   - La condition "Query String does not contain token" est correcte
   - Assurez-vous que les deux conditions sont configurées

### Problème : Boucle de redirection

Si vous avez une boucle :
1. Vérifier que la règle ne s'applique pas aux URLs avec `?token=`
2. Vérifier que la route Next.js `/api/librespeed-redirect` redirige correctement

### Problème : API Token invalide

Si le script échoue avec une erreur 401 :
1. Vérifier que le token est correct
2. Vérifier que le token a les permissions nécessaires
3. Utiliser la méthode manuelle si nécessaire

---

## 📚 Documentation

- Guide complet : `GUIDE_CLOUDFLARE_REDIRECT_RULES.md`
- Script de configuration : `configure-redirect-rules.ps1`
- Script de test : `test-redirect-rules.ps1`

---

## 🎯 Prochaines Étapes

Une fois la Redirect Rule configurée :

1. ✅ Redémarrer le tunnel Cloudflare si nécessaire
2. ✅ Tester avec `.\test-redirect-rules.ps1`
3. ✅ Vérifier que les fonctionnalités de LibreSpeed fonctionnent correctement

Si les fonctionnalités sont bloquées, voir `GUIDE_CLOUDFLARE_REDIRECT_RULES.md` section "Alternative : Proxy Next.js pour Token"

