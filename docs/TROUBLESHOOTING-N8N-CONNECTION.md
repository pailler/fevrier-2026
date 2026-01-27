# Dépannage : Échec de connexion à n8n

## Diagnostic étape par étape

### Étape 1 : Vérifier que n8n est en cours d'exécution

**Sur le NAS (via SSH)** :

```bash
sudo docker ps | grep n8n
```

Vous devriez voir :
```
n8n            Up X minutes    0.0.0.0:5678->5678/tcp
n8n-postgres   Up X minutes    5432/tcp
```

Si les conteneurs ne sont pas en cours d'exécution :

```bash
cd /volume1/docker/n8n
sudo docker-compose up -d
```

### Étape 2 : Vérifier les logs n8n

```bash
sudo docker logs n8n --tail 50
```

Recherchez des erreurs :
- `EACCES: permission denied` → Problème de permissions
- `Mismatching encryption keys` → Problème de clé de chiffrement
- `Error connecting to database` → Problème de connexion PostgreSQL
- `EADDRINUSE` → Port déjà utilisé

### Étape 3 : Vérifier que n8n répond localement

**Sur le NAS** :

```bash
curl http://localhost:5678/healthz
```

Vous devriez voir une réponse `200 OK` ou similaire.

Si cela ne fonctionne pas, n8n n'est pas accessible même localement.

### Étape 4 : Vérifier Traefik

**Sur votre machine Windows** :

```powershell
docker ps | Select-String "traefik"
```

Vérifiez que Traefik est en cours d'exécution.

### Étape 5 : Vérifier la configuration Traefik

Vérifiez que le fichier `traefik/dynamic/n8n.yml` existe et est correct :

```powershell
cat traefik/dynamic/n8n.yml
```

### Étape 6 : Tester la connexion depuis Traefik

**Sur votre machine Windows** :

```powershell
# Tester si Traefik peut atteindre n8n
curl http://localhost:5678/healthz
```

Si cela fonctionne, Traefik devrait pouvoir router vers n8n.

### Étape 7 : Vérifier le DNS

Vérifiez que le domaine `n8n.regispailler.fr` est bien configuré dans Cloudflare :

1. Cloudflare Dashboard → DNS → Records
2. Vérifiez que `n8n.regispailler.fr` existe et pointe vers votre serveur
3. Vérifiez que le proxy est activé (orange cloud)

## Solutions selon le problème

### Problème : n8n ne démarre pas

**Solution** :

```bash
# Sur le NAS
cd /volume1/docker/n8n
sudo docker-compose down
sudo docker-compose up -d
sudo docker logs n8n --tail 50
```

### Problème : Erreur de permissions

**Solution** :

```bash
# Sur le NAS
sudo docker stop n8n
sudo chown -R 0:0 /volume1/docker/n8n/n8n
sudo chmod -R 777 /volume1/docker/n8n/n8n
sudo rm -f /volume1/docker/n8n/n8n/crash.journal
sudo docker start n8n
```

### Problème : Erreur de clé de chiffrement

**Solution** :

```bash
# Sur le NAS
sudo docker stop n8n
sudo rm -f /volume1/docker/n8n/n8n/config
sudo docker start n8n
```

### Problème : Traefik ne route pas vers n8n

**Vérifications** :

1. **Vérifier que n8n est sur le bon réseau** :
   ```bash
   # Sur le NAS
   sudo docker network inspect n8n-net
   ```

2. **Vérifier que Traefik peut atteindre n8n** :
   - n8n est sur le réseau `n8n-net` (isolé)
   - Traefik utilise `host.docker.internal:5678` pour y accéder
   - Vérifiez que le port 5678 est bien exposé sur l'hôte

3. **Redémarrer Traefik** :
   ```powershell
   docker restart iahome-traefik
   ```

### Problème : Timeout ou connexion refusée

**Causes possibles** :

1. **Firewall bloque le port** : Vérifiez que le port 5678 est ouvert
2. **n8n n'écoute pas** : Vérifiez les logs n8n
3. **Traefik mal configuré** : Vérifiez la configuration Traefik

**Solution** :

```bash
# Sur le NAS - Vérifier que n8n écoute
sudo netstat -tlnp | grep 5678
```

Vous devriez voir :
```
tcp6       0      0 :::5678                 :::*                    LISTEN
```

## Test de connexion complet

### Test 1 : n8n localement sur le NAS

```bash
# Sur le NAS
curl http://localhost:5678/healthz
```

### Test 2 : n8n depuis l'IP du NAS

```bash
# Depuis votre machine Windows
curl http://IP_DU_NAS:5678/healthz
```

### Test 3 : n8n via Traefik

```bash
# Depuis votre machine Windows
curl -H "Host: n8n.regispailler.fr" http://localhost/healthz
```

### Test 4 : n8n via le domaine

```bash
# Depuis votre machine Windows
curl https://n8n.regispailler.fr/healthz
```

## Commandes de diagnostic rapide

### Sur le NAS

```bash
# Statut des conteneurs
sudo docker ps | grep n8n

# Logs n8n
sudo docker logs n8n --tail 30

# Test de santé
curl http://localhost:5678/healthz

# Vérifier les permissions
ls -ld /volume1/docker/n8n/n8n

# Vérifier le réseau
sudo docker network inspect n8n-net
```

### Sur votre machine Windows

```powershell
# Statut Traefik
docker ps | Select-String "traefik"

# Logs Traefik
docker logs iahome-traefik --tail 30

# Test local
curl http://localhost:5678/healthz

# Test via Traefik
curl -H "Host: n8n.regispailler.fr" http://localhost
```

## Checklist de vérification

- [ ] n8n est en cours d'exécution (`docker ps | grep n8n`)
- [ ] n8n répond localement (`curl http://localhost:5678/healthz`)
- [ ] Pas d'erreurs dans les logs n8n
- [ ] Traefik est en cours d'exécution
- [ ] Configuration Traefik correcte (`traefik/dynamic/n8n.yml`)
- [ ] DNS configuré dans Cloudflare
- [ ] Port 5678 accessible
- [ ] Permissions correctes sur `/volume1/docker/n8n/n8n`

## Contact

Si le problème persiste après avoir suivi ce guide, fournissez :
1. Les logs n8n : `sudo docker logs n8n --tail 50`
2. Les logs Traefik : `docker logs iahome-traefik --tail 50`
3. Le résultat de `curl http://localhost:5678/healthz` sur le NAS
4. Le statut des conteneurs : `sudo docker ps | grep n8n`
