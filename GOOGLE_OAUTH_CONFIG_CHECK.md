# Vérification Configuration Google OAuth

## Problème actuel
Erreur : `500: Database error granting user` lors de la tentative de connexion Google

## Cause probable
Problème de configuration dans Supabase :
1. Les credentials Google ne sont pas correctement configurés
2. La configuration OAuth dans Supabase Dashboard est incorrecte
3. Les URLs de redirection ne correspondent pas

## Solution recommandée

### 1. Vérifier la configuration Supabase

Allez sur https://supabase.com/dashboard
- Projet : xemtoyzcihmncbrlsmhr
- Section : Authentication → Providers
- Vérifiez que Google OAuth est activé

### 2. Vérifier les credentials Google

Dans Google Cloud Console :
- Client ID : `507950012705-vhalhjt8jnk5k2r6oijhpgfta0hv5rkt`
- Les URLs de redirection autorisées doivent inclure :
  - `https://xemtoyzcihmncbrlsmhr.supabase.co/auth/v1/callback`

### 3. Configuration nécessaire

Dans Supabase Dashboard → Authentication → Providers → Google :
- Client ID : `507950012705-vhalhjt8jnk5k2r6oijhpgfta0hv5rkt`
- Client Secret : `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`
- Activer Google OAuth

### 4. Alternative

Si le problème persiste, il sera nécessaire de :
1. Désactiver Google OAuth dans Supabase
2. Implémenter une connexion Google directe sans Supabase
3. Créer manuellement la session et le profil utilisateur

