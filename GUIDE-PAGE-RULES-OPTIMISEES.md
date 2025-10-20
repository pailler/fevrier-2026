# 🎯 Guide Page Rules Cloudflare Optimisées (3 règles max)

## 📋 **Configuration des 3 Page Rules**

### **Page Rule 1 : Protection générale des sous-domaines**
- **URL Pattern** : `*.iahome.fr/*`
- **Action** : `URL de transfert`
- **Destination** : `https://iahome.fr/subdomain-protection`
- **Status Code** : `302 - Redirection temporaire`

### **Page Rule 2 : Exclure le domaine principal**
- **URL Pattern** : `iahome.fr/*`
- **Action** : `Contrôle du cache d'origine`
- **Cache Level** : `Bypass`

### **Page Rule 3 : Exclure www (optionnel)**
- **URL Pattern** : `www.iahome.fr/*`
- **Action** : `Contrôle du cache d'origine`
- **Cache Level** : `Bypass`

## 🔧 **Comment ça fonctionne**

### **1. Accès direct aux sous-domaines**
- **URL** : `https://librespeed.iahome.fr`
- **Résultat** : Redirection vers `https://iahome.fr/subdomain-protection`
- **Page affichée** : Page de protection avec message d'erreur

### **2. Accès avec token (via bouton IAHome)**
- **URL** : `https://librespeed.iahome.fr` (depuis le bouton d'accès)
- **Résultat** : Redirection vers `https://iahome.fr/subdomain-protection?token=ABC123`
- **Page affichée** : Vérification du token → Redirection vers l'application

### **3. Accès au domaine principal**
- **URL** : `https://iahome.fr`
- **Résultat** : Application Next.js normale (pas de redirection)

## 🎯 **Avantages de cette solution**

✅ **Gratuite** : Utilise seulement 3 Page Rules (limite gratuite)  
✅ **Sécurisée** : Validation des tokens côté application  
✅ **Flexible** : Gestion centralisée des accès  
✅ **Évolutive** : Facile d'ajouter de nouveaux modules  

## 🚀 **Test de la solution**

### **Test 1 : Accès direct (doit échouer)**
1. Allez sur `https://librespeed.iahome.fr`
2. **Attendu** : Page de protection avec message d'erreur

### **Test 2 : Accès avec token (doit réussir)**
1. Allez sur `https://iahome.fr`
2. Connectez-vous à votre compte
3. Allez dans `/encours`
4. Cliquez sur "Accéder à LibreSpeed"
5. **Attendu** : Redirection vers LibreSpeed

### **Test 3 : Domaine principal (doit fonctionner)**
1. Allez sur `https://iahome.fr`
2. **Attendu** : Application Next.js normale

## 🔧 **Configuration des Page Rules**

### **Étape 1 : Créer la Page Rule de protection**
1. Allez dans **Cloudflare Dashboard** → **Page Rules**
2. Cliquez sur **"Create Page Rule"**
3. **URL Pattern** : `*.iahome.fr/*`
4. **Action** : `URL de transfert`
5. **Destination** : `https://iahome.fr/subdomain-protection`
6. **Status Code** : `302`
7. Cliquez sur **"Enregistrer Page Rule"**

### **Étape 2 : Exclure le domaine principal**
1. Cliquez sur **"Create Page Rule"**
2. **URL Pattern** : `iahome.fr/*`
3. **Action** : `Contrôle du cache d'origine`
4. **Cache Level** : `Bypass`
5. Cliquez sur **"Enregistrer Page Rule"**

### **Étape 3 : Exclure www (optionnel)**
1. Cliquez sur **"Create Page Rule"**
2. **URL Pattern** : `www.iahome.fr/*`
3. **Action** : `Contrôle du cache d'origine`
4. **Cache Level** : `Bypass`
5. Cliquez sur **"Enregistrer Page Rule"**

## 🎉 **Résultat final**

- ✅ **Protection des sous-domaines** : Accès direct bloqué
- ✅ **Accès autorisé** : Via tokens générés par IAHome
- ✅ **Gratuit** : Utilise seulement 3 Page Rules
- ✅ **Sécurisé** : Validation des tokens côté application
- ✅ **Évolutif** : Facile d'ajouter de nouveaux modules

## 🔍 **Dépannage**

### **Problème : La redirection ne fonctionne pas**
- Vérifiez que les Page Rules sont dans le bon ordre
- Vérifiez que le tunnel Cloudflare est actif
- Vérifiez que l'application Next.js est en cours d'exécution

### **Problème : Le token n'est pas validé**
- Vérifiez que `NEXT_PUBLIC_JWT_SECRET` est défini
- Vérifiez que le token n'est pas expiré
- Vérifiez les logs de l'application Next.js

### **Problème : L'application ne se lance pas**
- Vérifiez que le service Docker est en cours d'exécution
- Vérifiez que le port est correct dans la configuration
- Vérifiez les logs du tunnel Cloudflare
