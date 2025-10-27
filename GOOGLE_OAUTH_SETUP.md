# Configuration Google OAuth pour iahome.fr

## Problème
Le flux OAuth Google ne fonctionne pas correctement avec Supabase.

## Solution recommandée

### 1. Vérifier la configuration dans Supabase Dashboard

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet (xemtoyzcihmncbrlsmhr)
3. Allez dans **Authentication** > **Providers** > **Google**
4. Vérifiez que les URLs de redirection autorisées incluent :
   - `https://iahome.fr/auth/callback`
   - `https://www.iahome.fr/auth/callback`

### 2. Configuration Google Cloud Console

1. Allez sur https://console.cloud.google.com/
2. Sélectionnez le projet avec Client ID : `507950012705-vhalhjt8jnk5k2r6oijhpgfta0hv5rkt`
3. Allez dans **APIs & Services** > **Credentials**
4. Modifiez les **Authorized redirect URIs** :
   - `https://xemtoyzcihmncbrlsmhr.supabase.co/auth/v1/callback`

### 3. Le flux actuel

```
1. Utilisateur clique sur "Se connecter avec Google"
2. Redirection vers Google OAuth
3. Utilisateur autorise l'application
4. Google redirige vers Supabase : https://xemtoyzcihmncbrlsmhr.supabase.co/auth/v1/callback
5. Supabase échange le code et redirige vers : https://iahome.fr/auth/callback
6. Notre page /auth/callback gère la session et redirige vers /
```

### 4. Code actuel

Le composant `GoogleSignInButton` utilise le flux PKCE standard de Supabase.

Les problèmes possibles :
- URLs de redirection non configurées correctement dans Supabase
- Session non persistée correctement
- Problème de cookies en HTTPS

