# Vérification de la configuration n8n

## Configuration actuelle sur le NAS

Votre docker-compose.yml sur le NAS est correct ! ✅

- ✅ `N8N_SECURE_COOKIE: "true"` est présent
- ✅ Pas de ligne `user: "1000:1000"` (utilise root par défaut)
- ✅ `N8N_ENCRYPTION_KEY` est commenté (évite les conflits)
- ✅ Toutes les variables HTTPS sont configurées

## Actions à effectuer

### 1. Redémarrer n8n pour appliquer N8N_SECURE_COOKIE

Si vous venez d'ajouter `N8N_SECURE_COOKIE: "true"`, redémarrez n8n :

```bash
# Sur le NAS
cd /volume1/docker/n8n
sudo docker-compose restart n8n
```

### 2. Attendre le démarrage complet

```bash
# Attendre 30 secondes
sleep 30

# Vérifier les logs
sudo docker logs n8n --tail 30
```

### 3. Vérifier que la variable est bien appliquée

```bash
# Sur le NAS
sudo docker exec n8n env | grep N8N_SECURE_COOKIE
```

Vous devriez voir : `N8N_SECURE_COOKIE=true`

### 4. Tester dans le navigateur

1. **Videz le cache** (Ctrl+F5 ou Cmd+Shift+R)
2. **Accédez à** : `https://n8n.regispailler.fr`
3. **L'erreur de cookie sécurisé devrait disparaître**

## Si l'erreur persiste

### Vérification 1 : Les headers Traefik

Vérifiez que Traefik passe bien les headers HTTPS. Les logs Traefik devraient montrer les requêtes :

```powershell
# Sur votre machine Windows
docker logs iahome-traefik --tail 50 | Select-String "n8n"
```

### Vérification 2 : n8n détecte HTTPS

Testez si n8n reçoit bien les headers :

```bash
# Sur le NAS
sudo docker exec n8n env | grep -E "N8N_PROTOCOL|N8N_SECURE_COOKIE"
```

Vous devriez voir :
```
N8N_PROTOCOL=https
N8N_SECURE_COOKIE=true
```

### Vérification 3 : Cookies dans le navigateur

1. Ouvrez les DevTools (F12)
2. Allez dans **Application** → **Cookies** → `https://n8n.regispailler.fr`
3. Vérifiez que les cookies ont l'option **Secure** cochée

## Solution alternative : Désactiver temporairement

Si le problème persiste et que vous voulez tester rapidement :

```yaml
N8N_SECURE_COOKIE: "false"
```

⚠️ **Non recommandé en production**, mais utile pour diagnostiquer.

## Checklist finale

- [ ] `N8N_SECURE_COOKIE: "true"` dans docker-compose.yml sur le NAS
- [ ] n8n redémarré après modification
- [ ] Variable visible dans `docker exec n8n env`
- [ ] Cache du navigateur vidé
- [ ] Accès via `https://` (pas `http://`)
- [ ] Headers Traefik corrects (`X-Forwarded-Proto: https`)

## Script de vérification

J'ai créé un script pour vérifier tout automatiquement :

```bash
# Transférez le script sur le NAS
scp scripts/verify-n8n-config-on-nas.sh admin@192.168.1.130:/tmp/

# Sur le NAS
chmod +x /tmp/verify-n8n-config-on-nas.sh
bash /tmp/verify-n8n-config-on-nas.sh
```
