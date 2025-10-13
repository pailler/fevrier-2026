# Guide de configuration Resend pour IAHome

## 📋 Étapes de configuration

### 1. Créer un compte Resend
- Allez sur [https://resend.com](https://resend.com)
- Créez un compte ou connectez-vous
- Vérifiez votre email

### 2. Obtenir la clé API
- Dans le dashboard Resend, allez dans "API Keys"
- Cliquez sur "Create API Key"
- Donnez un nom à votre clé (ex: "IAHome Production")
- Copiez la clé API générée

### 3. Configurer le domaine
- Dans le dashboard Resend, allez dans "Domains"
- Cliquez sur "Add Domain"
- Entrez "iahome.fr"
- Suivez les instructions pour configurer les enregistrements DNS

### 4. Configurer les variables d'environnement
- Ouvrez le fichier `.env.local` dans votre projet
- Remplacez `your_resend_api_key_here` par votre vraie clé API
- Vérifiez que `RESEND_FROM_EMAIL=noreply@iahome.fr` est correct

### 5. Redémarrer le serveur
- Arrêtez le serveur de développement (`Ctrl+C`)
- Relancez avec `npm run dev`

## 🔧 Variables d'environnement requises

```bash
# Configuration Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@iahome.fr
```

## 🧪 Test de la configuration

Une fois configuré, vous pouvez tester avec :

```bash
# Test de l'API
curl http://localhost:3000/api/test-resend-domain

# Test d'envoi d'email (via l'interface admin)
# Allez sur /admin/notifications et utilisez le formulaire de test
```

## 📊 Vérification du statut

La page `/admin/notifications` affichera :
- ✅ Configuration API : Configuré
- ✅ Email d'expédition : noreply@iahome.fr
- ✅ Domaines disponibles : 1 (iahome.fr)
- ✅ Test d'envoi : Réussi

## 🚨 Problèmes courants

### Clé API invalide
- Vérifiez que la clé commence par `re_`
- Assurez-vous qu'elle n'a pas expiré
- Vérifiez les permissions de la clé

### Domaine non vérifié
- Vérifiez les enregistrements DNS dans votre hébergeur
- Attendez la propagation DNS (peut prendre jusqu'à 24h)
- Utilisez des outils comme `dig` pour vérifier

### Email non reçu
- Vérifiez les spams
- Testez avec un autre email
- Vérifiez les logs dans Resend

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans `/admin/notifications`
2. Consultez la documentation Resend
3. Testez avec l'API directement
