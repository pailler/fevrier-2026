# 🔧 Dépannage - Erreur "Non autorisé" Portfolio Photo IA

## 🚨 Problème identifié

**Erreur :** `"Non autorisé"` lors de l'upload de photos

**Cause :** Problème d'authentification entre le frontend et l'API

## ✅ Solutions appliquées

### 1. Modification de l'API d'upload
- ✅ Ajout de la vérification du token Bearer
- ✅ Utilisation de `supabase.auth.getUser(token)`
- ✅ Messages d'erreur plus détaillés

### 2. Modification du composant PhotoUpload
- ✅ Ajout de l'envoi du token d'authentification
- ✅ Vérification de la session avant l'upload
- ✅ Gestion des erreurs d'authentification

## 🔍 Tests de diagnostic

### 1. Test d'authentification
Ouvrez `test-auth.html` dans votre navigateur :
```
http://localhost:3000/test-auth.html
```

### 2. Vérifications à effectuer
- [ ] Configuration Supabase OK
- [ ] Utilisateur connecté
- [ ] Token d'authentification valide
- [ ] Tables de base de données accessibles
- [ ] Test d'upload fonctionnel

## 🚀 Étapes de résolution

### Étape 1 : Vérifier l'authentification
1. Allez à `http://localhost:3000/photo-portfolio`
2. Connectez-vous avec Google ou email
3. Vérifiez que vous êtes bien connecté

### Étape 2 : Tester l'upload
1. Allez dans l'onglet "Upload"
2. Glissez-déposez une photo
3. Vérifiez que l'upload fonctionne

### Étape 3 : Diagnostic avancé
1. Ouvrez `test-auth.html`
2. Cliquez sur "Tester la configuration"
3. Cliquez sur "Se connecter avec Google"
4. Cliquez sur "Tester l'upload"

## 🔧 Configuration requise

### Variables d'environnement
Vérifiez que `.env.local` contient :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xemtoyzcihmncbrlsmhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
```

### Base de données
- [ ] pgvector activé
- [ ] Tables créées
- [ ] Politiques RLS configurées
- [ ] Bucket de stockage créé

## 🆘 Erreurs courantes

### "Token d'authentification manquant"
**Solution :** Vérifiez que l'utilisateur est connecté

### "Non autorisé - Token invalide"
**Solution :** Reconnectez-vous avec Google

### "Vous devez être connecté pour uploader des photos"
**Solution :** Cliquez sur "Se connecter" dans l'interface

### "Erreur de connexion"
**Solution :** Vérifiez les variables d'environnement

## 📋 Checklist de résolution

- [ ] Serveur Next.js démarré (`npm run dev`)
- [ ] Variables d'environnement configurées
- [ ] Utilisateur connecté dans l'application
- [ ] Test d'authentification réussi
- [ ] Test d'upload réussi
- [ ] Base de données accessible

## 🎯 Test final

1. **Accédez à** : `http://localhost:3000/photo-portfolio`
2. **Connectez-vous** avec Google
3. **Allez dans "Upload"**
4. **Glissez-déposez une photo**
5. **Vérifiez** que l'upload fonctionne sans erreur

---

**🎉 Si tout fonctionne, votre Portfolio Photo IA est opérationnel !**
