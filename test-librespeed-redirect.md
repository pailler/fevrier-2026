# 🧪 Test de la redirection LibreSpeed

## 📋 Instructions de test

### Étape 1 : Redémarrer Traefik

```powershell
# Vérifier que Traefik est actif
docker-compose ps traefik

# Redémarrer Traefik pour charger la nouvelle configuration
docker-compose restart traefik

# Vérifier les logs pour s'assurer qu'il n'y a pas d'erreurs
docker-compose logs traefik --tail 50
```

### Étape 2 : Test de redirection directe

1. **Ouvrir un navigateur en navigation privée** (pour éviter les cookies de session)
2. **Aller sur** : `https://librespeed.iahome.fr` ou `http://librespeed.iahome.fr`
3. **Résultat attendu** : Redirection automatique vers `https://iahome.fr`

### Étape 3 : Test depuis iahome.fr (accès autorisé)

1. **Se connecter sur** : `https://iahome.fr`
2. **Aller sur la page `/encours`**
3. **Cliquer sur le bouton d'accès LibreSpeed**
4. **Résultat attendu** : L'application LibreSpeed s'ouvre (via proxy sécurisé)

### Étape 4 : Vérifier les logs Traefik

```powershell
# Voir les dernières requêtes
docker-compose logs traefik --tail 100 --follow

# Filtrer les requêtes librespeed
docker-compose logs traefik | Select-String "librespeed"
```

## 🔍 Vérification de la configuration

### Routes configurées pour librespeed

1. **Route de redirection HTTP** (priorité 200)
   - EntryPoint: `web` (port 80)
   - Rule: `Host(librespeed.iahome.fr) && !PathPrefix(/.well-known/acme-challenge)`
   - Action: Redirige vers `https://iahome.frulia`

2. **Route de redirection HTTPS** (priorité 200)
   - EntryPoint: `websecure` (port 443)
   - Rule: `Host(librespeed.iahome.fr) && !PathPrefix(/.well-known/acme-challenge)`
   - Action: Redirige vers `https://iahome.fr`

3. **Route ACME** (priorité 1000) - Toujours prioritaire
   - EntryPoint: `web` (port 80)
   - Rule: `Host(librespeed.iahome.fr) && PathPrefix(/.well-known/acme-challenge)`
   - Action: Permet les challenges Let's Encrypt

4. **Route principale** (priorité 100) - Utilisée seulement si pas de redirection
   - EntryPoint: `web` (port 80)
   - Rule: `Host(librespeed.iahome.fr)`
   - Action: Dirige vers le service librespeed-auth

## ⚠️ Problèmes possibles

### Problème 1 : Pas de redirection
- **Cause** : Les routes de redirection ont une priorité plus basse que prévu
- **Solution** : Vérifier que la priorité est bien à 200 dans `subdomain-page-rules.yml`

### Problème 2 : Redirection en boucle
- **Cause** : La redirection pointe vers une URL qui redirige à nouveau
- **Solution** : Vérifier que `iahome.fr` ne redirige pas vers librespeed

### Problème 3 : Les accès autorisés sont bloqués
- **Cause** : Les routes de redirection interceptent tous les accès
- **Solution** : Les accès autorisés doivent passer par les routes proxy Next.js (`/api/secure-proxy`)

## ✅ Résultats attendus

- ✅ Accès direct → Redirection vers `iahome.fr`
- ✅ Accès via proxy Next.js depuis iahome.fr → Fonctionne
- ✅ Challenges Let's Encrypt → Fonctionnent (priorité 1000)

