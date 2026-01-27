# Résolution : Erreur "secure cookie" persiste malgré N8N_SECURE_COOKIE: "true"

## Problème

L'erreur persiste même après avoir ajouté `N8N_SECURE_COOKIE: "true"` dans le docker-compose.yml.

## Causes possibles

1. **n8n n'a pas été redémarré** après l'ajout de la variable
2. **Les headers Traefik ne sont pas correctement passés**
3. **Cache du navigateur** qui garde l'ancienne version
4. **n8n ne détecte pas HTTPS** correctement

## Solutions étape par étape

### Solution 1 : Vérifier que n8n a bien la variable

**Sur le NAS** :

```bash
sudo docker exec n8n env | grep N8N_SECURE_COOKIE
```

Vous devriez voir : `N8N_SECURE_COOKIE=true`

Si vous ne voyez rien, n8n n'a pas été redémarré après l'ajout de la variable.

### Solution 2 : Redémarrer n8n complètement

**Sur le NAS** :

```bash
cd /volume1/docker/n8n
sudo docker-compose down
sudo docker-compose up -d
```

Attendez 30 secondes, puis vérifiez :

```bash
sudo docker logs n8n --tail 30
```

### Solution 3 : Vérifier les headers Traefik

Vérifiez que Traefik passe bien `X-Forwarded-Proto: https`. Testez :

```powershell
# Sur votre machine Windows
curl -H "Host: n8n.regispailler.fr" http://localhost/healthz -v
```

Recherchez dans la réponse les headers `X-Forwarded-Proto`.

### Solution 4 : Désactiver temporairement pour tester

Si vous voulez tester rapidement, modifiez temporairement sur le NAS :

```yaml
N8N_SECURE_COOKIE: "false"
```

Puis redémarrez :

```bash
sudo docker-compose restart n8n
```

Si l'erreur disparaît avec `false`, le problème vient de la détection HTTPS par n8n.

### Solution 5 : Vider complètement le cache du navigateur

1. Ouvrez les DevTools (F12)
2. Clic droit sur le bouton de rafraîchissement
3. Sélectionnez **"Vider le cache et effectuer une actualisation forcée"**
4. Ou utilisez Ctrl+Shift+Delete pour vider tout le cache

### Solution 6 : Tester en navigation privée

Ouvrez une fenêtre de navigation privée et testez : `https://n8n.regispailler.fr`

Si cela fonctionne en navigation privée, c'est un problème de cache.

## Diagnostic complet

### Étape 1 : Vérifier la configuration n8n

**Sur le NAS** :

```bash
# Vérifier les variables d'environnement
sudo docker exec n8n env | grep -E "N8N_PROTOCOL|N8N_SECURE_COOKIE|N8N_EDITOR_BASE_URL"

# Vérifier les logs
sudo docker logs n8n --tail 50 | grep -i "cookie\|secure"
```

### Étape 2 : Vérifier la configuration Traefik

**Sur votre machine Windows** :

```powershell
# Vérifier que Traefik passe bien les headers
docker logs iahome-traefik --tail 50 | Select-String "n8n"
```

### Étape 3 : Tester la connexion directe

**Sur le NAS** :

```bash
# Tester n8n directement
curl http://localhost:5678/healthz
```

### Étape 4 : Tester via Traefik

**Sur votre machine Windows** :

```powershell
# Tester via Traefik
curl -H "Host: n8n.regispailler.fr" http://localhost/healthz -v
```

## Solution alternative : Forcer HTTPS dans n8n

Si le problème persiste, vous pouvez forcer n8n à toujours utiliser HTTPS :

**Sur le NAS**, modifiez le docker-compose.yml :

```yaml
environment:
  # ... autres variables ...
  N8N_PROTOCOL: https
  N8N_SECURE_COOKIE: "true"
  # Forcer la détection HTTPS
  N8N_METRICS: "false"
```

## Vérification finale

Après avoir appliqué toutes les solutions :

1. **Redémarrez n8n** complètement (down/up)
2. **Attendez 30 secondes**
3. **Videz le cache du navigateur** complètement
4. **Testez en navigation privée**
5. **Accédez à** : `https://n8n.regispailler.fr`

## Si rien ne fonctionne

Comme dernière solution, vous pouvez temporairement désactiver les cookies sécurisés :

```yaml
N8N_SECURE_COOKIE: "false"
```

⚠️ **Non recommandé en production**, mais cela permettra de confirmer que le problème vient bien de la détection HTTPS.
