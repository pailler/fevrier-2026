# Résolution : Erreur "secure cookie" sur n8n (NAS)

## Problème

L'erreur persiste même après avoir configuré Traefik. Cela signifie que le docker-compose.yml sur le NAS n'a probablement pas la variable `N8N_SECURE_COOKIE`.

## Solution : Mettre à jour le docker-compose.yml sur le NAS

### Étape 1 : Connectez-vous au NAS

```bash
ssh admin@192.168.1.130
```

### Étape 2 : Modifiez le docker-compose.yml

```bash
sudo nano /volume1/docker/n8n/docker-compose.yml
```

### Étape 3 : Ajoutez N8N_SECURE_COOKIE

Trouvez la section `environment:` du service `n8n` et ajoutez cette ligne :

```yaml
environment:
  # ... autres variables ...
  N8N_EDITOR_BASE_URL: "https://n8n.regispailler.fr"
  N8N_SECURE_COOKIE: "true"  # Ajoutez cette ligne
  # ... autres variables ...
```

### Étape 4 : Sauvegardez et redémarrez

Sauvegardez (Ctrl+O, Enter, Ctrl+X), puis :

```bash
cd /volume1/docker/n8n
sudo docker-compose restart n8n
```

### Étape 5 : Vérifiez

Attendez 30 secondes, puis testez dans votre navigateur : `https://n8n.regispailler.fr`

## Solution avec script automatique

J'ai créé un script qui fait tout automatiquement :

```bash
# Transférez le script sur le NAS
scp scripts/update-n8n-docker-compose-on-nas.sh admin@192.168.1.130:/tmp/

# Sur le NAS
chmod +x /tmp/update-n8n-docker-compose-on-nas.sh
bash /tmp/update-n8n-docker-compose-on-nas.sh
```

## Configuration complète à avoir sur le NAS

Voici les variables d'environnement importantes à avoir dans le docker-compose.yml sur le NAS :

```yaml
environment:
  # Configuration HTTPS
  N8N_PROTOCOL: https
  N8N_HOST: n8n.regispailler.fr
  N8N_PORT: 5678
  N8N_EDITOR_BASE_URL: "https://n8n.regispailler.fr"
  WEBHOOK_URL: "https://n8n.regispailler.fr"
  
  # Cookies sécurisés - IMPORTANT
  N8N_SECURE_COOKIE: "true"
```

## Alternative : Désactiver temporairement (pour tester)

Si vous voulez tester rapidement sans modifier le NAS, vous pouvez temporairement désactiver :

```yaml
N8N_SECURE_COOKIE: "false"
```

⚠️ **Non recommandé en production**, mais utile pour tester.

## Vérification

Après avoir ajouté `N8N_SECURE_COOKIE: "true"` et redémarré n8n :

1. **Videz le cache du navigateur** (Ctrl+F5)
2. **Accédez à** : `https://n8n.regispailler.fr`
3. **L'erreur devrait disparaître**

## Si le problème persiste

1. **Vérifiez les logs n8n** :
   ```bash
   sudo docker logs n8n --tail 50
   ```

2. **Vérifiez que la variable est bien définie** :
   ```bash
   sudo docker exec n8n env | grep N8N_SECURE_COOKIE
   ```

3. **Vérifiez que vous accédez bien via HTTPS** : `https://n8n.regispailler.fr` (pas `http://`)

4. **Vérifiez les headers Traefik** : Assurez-vous que `X-Forwarded-Proto: https` est bien passé
