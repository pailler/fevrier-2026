# 🔒 Guide de configuration manuelle des Page Rules Cloudflare

## Problème identifié
Le token Cloudflare n'a pas les permissions pour les Workers. Utilisons les Page Rules (gratuites, limitées à 3) pour protéger les sous-domaines les plus importants.

## Configuration manuelle via l'interface Cloudflare

### Étape 1 : Accéder à l'interface Cloudflare
1. Allez sur [dash.cloudflare.com](https://dash.cloudflare.com)
2. Connectez-vous avec vos identifiants
3. Sélectionnez le domaine `iahome.fr`
4. Allez dans **"Rules"** > **"Page Rules"**

### Étape 2 : Créer les Page Rules (Maximum 3 gratuites)

#### **Page Rule 1 : Protection générale des sous-domaines**
- **URL Pattern :** `*.iahome.fr/*`
- **Setting :** `Forwarding URL`
- **Status Code :** `302 (Temporary Redirect)`
- **Destination URL :** `https://iahome.fr/encours`

#### **Page Rule 2 : Exception pour iahome.fr**
- **URL Pattern :** `iahome.fr/*`
- **Setting :** `Always Use HTTPS`
- **Status Code :** `301 (Permanent Redirect)`

#### **Page Rule 3 : Exception pour www.iahome.fr**
- **URL Pattern :** `www.iahome.fr/*`
- **Setting :** `Always Use HTTPS`
- **Status Code :** `301 (Permanent Redirect)`

### Étape 3 : Configuration avancée (Optionnelle)

Si vous avez un plan Cloudflare payant, vous pouvez créer des règles WAF plus sophistiquées :

#### **Règle WAF 1 : Bloquer l'accès direct (sans token)**
- **Expression :** 
  ```
  (http.host contains ".iahome.fr") and (http.host ne "iahome.fr") and not (http.request.uri.query contains "token")
  ```
- **Action :** `Block`
- **Response :** `Custom response`
- **Status code :** `302`
- **Response headers :** `Location: https://iahome.fr/encours`

#### **Règle WAF 2 : Bloquer les bots**
- **Expression :** 
  ```
  (http.host contains ".iahome.fr") and (http.host ne "iahome.fr") and (http.user_agent contains "bot")
  ```
- **Action :** `Block`

#### **Règle WAF 3 : Bloquer curl/wget**
- **Expression :** 
  ```
  (http.host contains ".iahome.fr") and (http.host ne "iahome.fr") and (http.user_agent contains "curl")
  ```
- **Action :** `Block`

## Tests de validation

### Test 1 : Accès direct (doit rediriger)
```bash
curl -I https://librespeed.iahome.fr
# Résultat attendu : 302 Redirect vers iahome.fr/encours
```

### Test 2 : Accès avec token (doit fonctionner)
```bash
curl -I "https://librespeed.iahome.fr?token=abc123"
# Résultat attendu : 200 OK (accès autorisé)
```

### Test 3 : Accès via iahome.fr (doit fonctionner)
- Ouvrir `https://iahome.fr/encours` dans le navigateur
- Cliquer sur le bouton d'accès à LibreSpeed
- **Résultat attendu :** Accès autorisé

## Avantages de cette solution

✅ **Gratuite** - Utilise les Page Rules gratuites
✅ **Simple** - Configuration via l'interface web
✅ **Efficace** - Redirection immédiate
✅ **Fiable** - Pas de dépendance à des services externes

## Limitations

⚠️ **Maximum 3 Page Rules** - Limitation du plan gratuit
⚠️ **Pas de vérification de tokens** - Redirection pour tous les accès directs
⚠️ **Pas de protection contre les bots** - Nécessite un plan payant

## Alternative : Solution hybride

Si vous voulez plus de contrôle, vous pouvez :

1. **Utiliser les 3 Page Rules** pour les sous-domaines les plus importants
2. **Modifier les applications** pour vérifier les tokens côté serveur
3. **Utiliser un proxy local** pour gérer la logique de protection

## Prochaines étapes

1. **Configurer les Page Rules** via l'interface Cloudflare
2. **Tester la redirection** sur les sous-domaines
3. **Vérifier que iahome.fr** fonctionne normalement
4. **Documenter la configuration** pour la maintenance

## Support

En cas de problème :
1. Vérifier les logs Cloudflare
2. Tester les règles une par une
3. Consulter la documentation Cloudflare
4. Contacter le support si nécessaire
