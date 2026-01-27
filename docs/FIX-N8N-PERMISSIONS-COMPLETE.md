# Résolution complète : Permissions n8n sur NAS Synology

## Problème

L'erreur `EACCES: permission denied, open '/home/node/.n8n/crash.journal'` indique que n8n n'a pas les permissions pour écrire dans le répertoire monté depuis le NAS.

## Solution rapide (Recommandée)

### Option 1 : Retirer la ligne `user` du docker-compose (Utiliser root)

C'est la solution la plus simple pour Synology :

#### Étape 1 : Arrêter n8n

```bash
sudo docker stop n8n
```

#### Étape 2 : Modifier le docker-compose.yml

```bash
sudo nano /volume1/docker/n8n/docker-compose.yml
```

**Retirez ou commentez** la ligne :
```yaml
# user: "1000:1000"
```

#### Étape 3 : Corriger les permissions du répertoire

```bash
sudo chown -R 0:0 /volume1/docker/n8n/n8n
sudo chmod -R 755 /volume1/docker/n8n/n8n
```

#### Étape 4 : Nettoyer les fichiers problématiques

```bash
sudo rm -f /volume1/docker/n8n/n8n/config
sudo rm -f /volume1/docker/n8n/n8n/crash.journal
```

#### Étape 5 : Redémarrer

```bash
cd /volume1/docker/n8n
sudo docker-compose up -d
```

### Option 2 : Utiliser l'UID/GID de l'utilisateur NAS

Si vous préférez ne pas utiliser root :

#### Étape 1 : Trouver l'UID/GID

```bash
id admin
```

Exemple de sortie : `uid=1026(admin) gid=100(users)`

#### Étape 2 : Modifier le docker-compose.yml

```bash
sudo nano /volume1/docker/n8n/docker-compose.yml
```

Changez :
```yaml
user: "1026:100"  # Utilisez vos valeurs UID:GID
```

#### Étape 3 : Corriger les permissions

```bash
sudo chown -R 1026:100 /volume1/docker/n8n/n8n
sudo chmod -R 755 /volume1/docker/n8n/n8n
```

#### Étape 4 : Nettoyer et redémarrer

```bash
sudo rm -f /volume1/docker/n8n/n8n/config
sudo rm -f /volume1/docker/n8n/n8n/crash.journal
cd /volume1/docker/n8n
sudo docker-compose up -d
```

## Solution avec script automatique

J'ai créé un script qui fait tout automatiquement :

```bash
# Transférez le script sur le NAS
scp scripts/fix-n8n-permissions-complete.sh admin@VOTRE_NAS_IP:/tmp/

# Sur le NAS
chmod +x /tmp/fix-n8n-permissions-complete.sh
bash /tmp/fix-n8n-permissions-complete.sh
```

## Fichier docker-compose corrigé

J'ai créé un fichier `n8n-postgres-docker-compose-nas.yml` optimisé pour NAS Synology :

- Pas de ligne `user` (utilise root par défaut)
- `N8N_ENCRYPTION_KEY` commentée (pour éviter les conflits)
- Configuration optimisée pour Synology

Pour l'utiliser :

```bash
# Sur le NAS
cd /volume1/docker/n8n
sudo docker-compose -f n8n-postgres-docker-compose-nas.yml up -d
```

## Commandes complètes (copier-coller)

Voici toutes les commandes à exécuter une par une :

```bash
sudo docker stop n8n
```

```bash
sudo chown -R 0:0 /volume1/docker/n8n/n8n
```

```bash
sudo chmod -R 755 /volume1/docker/n8n/n8n
```

```bash
sudo rm -f /volume1/docker/n8n/n8n/config
```

```bash
sudo rm -f /volume1/docker/n8n/n8n/crash.journal
```

```bash
sudo rm -f /volume1/docker/n8n/n8n/*.journal
```

Modifiez le docker-compose.yml pour retirer `user: "1000:1000"` :

```bash
sudo nano /volume1/docker/n8n/docker-compose.yml
```

Puis redémarrez :

```bash
cd /volume1/docker/n8n
sudo docker-compose up -d
```

Attendez 20 secondes, puis vérifiez :

```bash
sudo docker logs n8n --tail 30
```

```bash
sudo docker ps | grep n8n
```

## Vérification

### Vérifier les permissions

```bash
ls -ld /volume1/docker/n8n/n8n
```

Vous devriez voir quelque chose comme :
```
drwxr-xr-x 1 root root 4096 Jan 21 14:00 /volume1/docker/n8n/n8n
```

### Vérifier que n8n peut écrire

```bash
sudo docker exec n8n touch /home/node/.n8n/test-write
```

Si cette commande réussit, les permissions sont correctes.

### Vérifier les logs

```bash
sudo docker logs n8n --tail 50
```

Vous ne devriez plus voir d'erreurs de permissions.

## Notes importantes

- ⚠️ **Root vs User** : Utiliser root est moins sécurisé mais fonctionne toujours. Pour la production, utilisez un utilisateur spécifique avec les bonnes permissions.
- 🔒 **Permissions** : Les permissions doivent correspondre à l'utilisateur défini dans `user:` du docker-compose
- 📁 **Volume** : Le volume monté doit avoir les permissions d'écriture pour l'utilisateur du conteneur
- 🔄 **Nettoyage** : Supprimez toujours les fichiers `config` et `crash.journal` avant de redémarrer

## Dépannage

### Le problème persiste après correction

1. **Vérifiez que la ligne `user` est bien retirée** du docker-compose.yml
2. **Vérifiez les permissions** : `ls -ld /volume1/docker/n8n/n8n`
3. **Vérifiez que le conteneur utilise root** : `sudo docker exec n8n id`
4. **Recréez complètement le répertoire** :
   ```bash
   sudo docker stop n8n
   sudo rm -rf /volume1/docker/n8n/n8n/*
   sudo docker start n8n
   ```

### Erreur "cannot connect to Docker daemon"

Utilisez `sudo` devant chaque commande Docker.

### Erreur "Mismatching encryption keys"

Commentez ou supprimez `N8N_ENCRYPTION_KEY` du docker-compose.yml, ou supprimez le fichier config.
