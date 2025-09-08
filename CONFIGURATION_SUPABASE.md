# Configuration Supabase pour IAhome

## 🚀 Étapes de configuration

### 1. Exécuter le script SQL

1. Aller sur [supabase.com](https://supabase.com) → Votre projet
2. Aller dans `SQL Editor`
3. Copier et coller le contenu de `supabase-auth-setup.sql`
4. Exécuter le script

### 2. Configurer les URLs de redirection

1. Aller dans `Authentication` → `URL Configuration`
2. Configurer :
   - **Site URL** : `https://iahome.fr`
   - **Redirect URLs** : `https://iahome.fr/auth/callback`

### 3. Configurer Google OAuth

1. Aller dans `Authentication` → `Providers` → `Google`
2. Activer Google
3. Configurer :
   - **Client ID** : `507950012705-vhalhjt8jnk5k2r6oijhpgfta0hv5rkt.apps.googleusercontent.com`
   - **Client Secret** : `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`
   - **Redirect URL** : `https://xemtoyzcihmncbrlsmhr.supabase.co/auth/v1/callback`

### 4. Vérifier la configuration

1. Exécuter le script `test-supabase-config.sql` dans l'éditeur SQL
2. Vérifier que toutes les tables, fonctions et politiques sont créées

## 🔧 Fonctionnalités configurées

### Table `user_applications`
- Stockage des informations utilisateur
- Synchronisation automatique avec `auth.users`
- Gestion des rôles (user, admin)
- Suivi des connexions

### Fonctions utiles
- `get_user_role(user_uuid)` : Obtenir le rôle d'un utilisateur
- `get_user_info(user_uuid)` : Obtenir les informations complètes d'un utilisateur

### Triggers automatiques
- Création automatique d'un enregistrement dans `user_applications` lors de l'inscription
- Mise à jour automatique de `last_login` lors de la connexion

## 🧪 Test de la configuration

1. Aller sur `https://iahome.fr/test-google`
2. Tester la connexion Google
3. Vérifier que l'utilisateur est créé dans `user_applications`
4. Vérifier que la redirection fonctionne correctement

## 🚨 Dépannage

### Page blanche au clic sur Google
- Vérifier que les URLs de redirection sont correctes
- Vérifier que Google OAuth est activé
- Vérifier les logs de la console du navigateur

### Erreur de redirection
- Vérifier que `https://iahome.fr/auth/callback` est dans les Redirect URLs
- Vérifier que le domaine `iahome.fr` est accessible

### Erreur de base de données
- Vérifier que le script SQL a été exécuté correctement
- Vérifier que les politiques RLS sont configurées
- Vérifier que les triggers sont actifs
