# 🔧 Correction Accès prompt-generator.iahome.fr avec Token

## ❌ Problème
- Erreur Cloudflare lors de l'accès à `https://prompt-generator.iahome.fr/?token=...`
- Le Worker Cloudflare bloque peut-être les requêtes

## ✅ Solutions appliquées

### 1. Configuration Traefik ✅
- ✅ Route `prompt-generator.iahome.fr` configurée
- ✅ Les query parameters (token) sont préservés automatiquement
- ✅ Backend : `host.docker.internal:9001`

### 2. Code source corrigé ✅
- ✅ Toutes les références au port 3002 supprimées
- ✅ URLs utilisent maintenant : `https://prompt-generator.iahome.fr`
- ✅ Fichiers modifiés :
  - `src/app/card/[id]/page.tsx`
  - `src/hooks/useModuleAccess.ts`
  - `src/app/encours/page.tsx`

## 🔧 Actions requises pour Cloudflare

### Étape 1 : Vérifier les routes du Worker

1. **Ouvrir** : https://dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/workers/services/view/protect-sous-domaines-iahome/production

2. **Aller dans** : Triggers → Routes

3. **Vérifier** que `prompt-generator.iahome.fr/*` est dans la liste des routes

4. **Si absent**, ajouter :
   - Pattern : `prompt-generator.iahome.fr/*`
   - Zone : `iahome.fr`

### Étape 2 : Vérifier le code du Worker

Le Worker doit gérer les tokens pour `prompt-generator.iahome.fr`. Le code actuel devrait déjà fonctionner car il vérifie `url.searchParams.has('token')` pour toutes les requêtes principales.

**Vérifier dans le Worker** que :
- Les requêtes avec `?token=...` sont laissées passer
- Les requêtes sans token sur `/` sont redirigées vers `iahome.fr/encours`

### Étape 3 : Vérifier le DNS

1. **Ouvrir** : Cloudflare Dashboard → DNS

2. **Vérifier** qu'un enregistrement existe pour `prompt-generator.iahome.fr` :
   - Type : `A` ou `CNAME`
   - Nom : `prompt-generator`
   - Proxy : ✅ Activé (orange cloud)

3. **Si absent**, créer :
   - Type : `A`
   - Nom : `prompt-generator`
   - IPv4 : IP de votre serveur
   - Proxy : ✅ Activé

### Étape 4 : Tester

1. **Attendre 5-10 minutes** pour la propagation DNS

2. **Tester l'URL** :
   ```
   https://prompt-generator.iahome.fr/?token=eyJ1c2VySWQiOiJhOThlMDgzZS1kNGUzLTQ5OGYtYmMxZS1jMDc0N2M4ODhmOTkiLCJ1c2VyRW1haWwiOiJmb3JtYXRldXJfdGljQGhvdG1haWwuY29tIiwibW9kdWxlSWQiOiJwcm9tcHQtZ2VuZXJhdG9yIiwibW9kdWxlVGl0bGUiOiJQcm9tcHQtZ2VuZXJhdG9yIiwiYWNjZXNzTGV2ZWwiOiJwcmVtaXVtIiwiZXhwaXJlc0F0IjoxNzY2NTc0MzY4Mjg0LCJwZXJtaXNzaW9ucyI6WyJyZWFkIiwiYWNjZXNzIiwid3JpdGUiLCJhZHZhbmNlZF9mZWF0dXJlcyJdLCJpc3N1ZWRBdCI6MTc2NjU3MDc2ODI4NCwiaWF0IjoxNzY2NTcwNzY4LCJleHAiOjE3NjY1NzQzNjh9
   ```

3. **Vérifier les logs Cloudflare** :
   - Workers → Logs
   - Voir si la requête passe ou est bloquée

## 🔍 Diagnostic

### Si l'erreur persiste :

1. **Vérifier les logs Traefik** :
   ```powershell
   docker logs iahome-traefik --tail 50 | Select-String "prompt-generator"
   ```

2. **Tester directement Traefik** :
   ```powershell
   curl -H "Host: prompt-generator.iahome.fr" http://localhost:80/?token=test
   ```

3. **Vérifier le service backend** :
   ```powershell
   curl http://localhost:9001/
   ```

4. **Vérifier les logs Cloudflare Worker** :
   - Dashboard → Workers → Logs
   - Filtrer par `prompt-generator.iahome.fr`

## 📝 Notes

- Le port 3002 n'est plus utilisé
- Toutes les URLs utilisent maintenant `https://prompt-generator.iahome.fr`
- Le token est préservé dans l'URL par Traefik
- Le Worker Cloudflare doit laisser passer les requêtes avec token


