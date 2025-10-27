# Configuration Supabase - Google OAuth

## Configuration URL (Visible sur votre écran)

### Site URL
```
https://iahome.fr
```
✅ **Correct**

### Redirect URLs
Garder uniquement :
```
✅ https://iahome.fr/auth/callback
✅ https://www.iahome.fr/auth/callback  
✅ http://localhost:3000/**
```

❌ **SUPPRIMER :**
- `http://localhost:3000`
- `https://iahome.fr/api/auth/google` (n'existe plus)

## Pourquoi l'erreur 500 ?

L'erreur "Database error granting user" indique que Supabase rencontre un problème lors de la création de l'utilisateur dans sa base de données interne (tables auth.users).

## Solution recommandée

1. Dans Supabase Dashboard → Authentication → Providers → Google
   - Vérifier que le Client ID est : `507950012705-vhalhjt8jnk5k2r6oijhpgfta0hv5rkt`
   - Client Secret : `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`
   - Activer Google OAuth

2. Dans Google Cloud Console
   - Autoriser ces URLs de redirection :
     - `https://xemtoyzcihmncbrlsmhr.supabase.co/auth/v1/callback`

3. Essayer la connexion Google

Si l'erreur persiste, le problème est côté Supabase (database error). Contactez le support Supabase.

